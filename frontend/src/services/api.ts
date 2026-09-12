import axios from "axios";

import type {
  ApplicantResponse,
  AuditLogEntry,
  AuditVerifyResult,
  AuthUser,
  DashboardStats,
  LoginResponse,
  MlModelInfo,
  MlPredictRequest,
  MlPredictResult,
  RawFinancials,
  RuleDraft,
  RuleRecord,
  SimulationResult,
} from "@/types";

export const TOKEN_STORAGE_KEY = "nbfc_token";

// Configurable API URLs with reliable development defaults
export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";
export const EXTRACTOR_BASE_URL =
  import.meta.env.VITE_EXTRACTOR_URL || "http://localhost:8001";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // If token expired on a protected route, clean up local session
      if (!error.config?.url?.includes("/auth/login")) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem("nbfc_user");
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login?expired=1";
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Diagnostic error message helper distinguishing between backend offline,
 * auth rejection, forbidden access, rate limits, and server bugs.
 */
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK" || error.code === "ECONNABORTED" || !error.response) {
      return "Backend server is unavailable. Please ensure the backend is running on http://localhost:5000.";
    }
    const detail = error.response?.data?.error || error.response?.data?.message;
    if (typeof detail === "string") return detail;

    const status = error.response?.status;
    if (status === 400) return "Invalid request payload. Please check submitted details.";
    if (status === 401) return "Invalid email or password / session expired.";
    if (status === 403) return "Forbidden — your role cannot perform this action.";
    if (status === 404) return "Requested resource was not found on the backend.";
    if (status === 429) return "Too many requests. Please wait a moment and try again.";
    if (status >= 500) return "Backend internal server error. Please check backend logs.";
    return error.message;
  }
  return error instanceof Error ? error.message : "An unexpected error occurred.";
}

/**
 * Retries a promise on transient network error (useful during initial startup)
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 1200): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries > 0 && axios.isAxiosError(err) && (!err.response || err.code === "ERR_NETWORK")) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return withRetry(fn, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

export async function checkBackendHealth(): Promise<{ status: string; database?: { status: string } }> {
  const { data } = await axios.get(`${API_BASE_URL}/health`, { timeout: 4000 });
  return data;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", { email, password });
  return data;
}

export async function evaluateApplication(payload: unknown): Promise<ApplicantResponse> {
  const { data } = await api.post<ApplicantResponse>("/applications/evaluate", payload);
  return data;
}

export async function simulateApplication(
  applicantId: string,
  overrides: Partial<RawFinancials>,
): Promise<SimulationResult> {
  const { data } = await api.post<SimulationResult>("/applications/simulate", {
    applicantId,
    overrides,
  });
  return data;
}

export interface ListApplicationsParams {
  status?: string;
  riskGrade?: string;
  search?: string;
}

export async function listApplications(params: ListApplicationsParams = {}): Promise<ApplicantResponse[]> {
  return withRetry(async () => {
    const { data } = await api.get<ApplicantResponse[]>("/applications", { params });
    return data;
  });
}

export async function getApplication(id: string): Promise<ApplicantResponse> {
  return withRetry(async () => {
    const { data } = await api.get<ApplicantResponse>(`/applications/${id}`);
    return data;
  });
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return withRetry(async () => {
    const { data } = await api.get<DashboardStats>("/applications/dashboard");
    return data;
  });
}

export interface ExceptionQueueParams {
  level?: "L1" | "L2";
  status?: "PENDING" | "APPROVED" | "REJECTED";
}

export async function getExceptionQueue(params: ExceptionQueueParams = {}): Promise<ApplicantResponse[]> {
  return withRetry(async () => {
    const { data } = await api.get<ApplicantResponse[]>("/applications/exceptions", { params });
    return data;
  });
}

export async function decideException(
  applicationId: string,
  decision: "APPROVED" | "REJECTED" | "ESCALATE",
  note?: string,
): Promise<ApplicantResponse> {
  const { data } = await api.post<ApplicantResponse>(`/applications/${applicationId}/decision`, {
    decision,
    note,
  });
  return data;
}

export async function getRules(): Promise<RuleRecord[]> {
  return withRetry(async () => {
    const { data } = await api.get<RuleRecord[]>("/rules");
    return data;
  });
}

export async function createRule(payload: RuleDraft): Promise<RuleRecord> {
  const { data } = await api.post<RuleRecord>("/rules", payload);
  return data;
}

export async function updateRule(
  ruleId: string,
  payload: Partial<RuleDraft>,
): Promise<RuleRecord> {
  const { data } = await api.put<RuleRecord>(`/rules/${ruleId}`, payload);
  return data;
}

export async function duplicateRule(ruleId: string): Promise<RuleRecord> {
  const { data } = await api.post<RuleRecord>(`/rules/${ruleId}/duplicate`);
  return data;
}

export interface RuleValidationResult {
  errors: string[];
  warnings: string[];
}

export async function validateRule(draft: Partial<RuleDraft>, excludeId?: string): Promise<RuleValidationResult> {
  const { data } = await api.post<RuleValidationResult>("/rules/validate", { draft, excludeId });
  return data;
}

export async function getAuditTrail(params: { targetId?: string; action?: string } = {}): Promise<AuditLogEntry[]> {
  return withRetry(async () => {
    const { data } = await api.get<AuditLogEntry[]>("/audit", { params });
    return data;
  });
}

export async function verifyAuditChain(): Promise<AuditVerifyResult> {
  const { data } = await api.get<AuditVerifyResult>("/audit/verify");
  return data;
}

export interface ExtractedDocumentFields {
  panNumber: string | null;
  monthlyIncome: number | null;
  cibilScore: number | null;
  bounceCountLast6M: number | null;
  avgMonthlyBalance: number | null;
}

export interface ExtractPdfResult {
  success: boolean;
  fileName?: string;
  extractedData?: ExtractedDocumentFields;
  missingFields?: string[];
  tablesFound?: number;
  error?: string;
}

export async function extractPdf(file: File): Promise<ExtractPdfResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await axios.post<ExtractPdfResult>(`${EXTRACTOR_BASE_URL}/api/extract-pdf`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ML risk model — called directly against the Python service, same as PDF
// extraction above. This is Admin console tooling only (route-gated in the
// frontend); the score's actual use inside a decision happens server-side
// in the Node backend's evaluation pipeline, not here.
export async function getMlModelInfo(): Promise<MlModelInfo> {
  try {
    const { data } = await axios.get<MlModelInfo>(`${EXTRACTOR_BASE_URL}/api/model-info`);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data) {
      return err.response.data as MlModelInfo;
    }
    return { ready: false, error: apiErrorMessage(err) };
  }
}

export async function predictMlRisk(payload: MlPredictRequest): Promise<MlPredictResult> {
  const { data } = await axios.post<MlPredictResult>(`${EXTRACTOR_BASE_URL}/api/predict-risk`, payload);
  return data;
}

export type { AuthUser };

export default api;

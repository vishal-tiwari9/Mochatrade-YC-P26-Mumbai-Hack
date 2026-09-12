function maskPan(panString) {
  if (!panString || panString.length < 5) return panString;
  return `XXXXX${panString.slice(-5)}`;
}

function maskPhone(phone) {
  if (!phone || phone.length < 4) return phone;
  return `${"X".repeat(phone.length - 4)}${phone.slice(-4)}`;
}

function maskEmail(email) {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  const visible = local.slice(0, 1) || "*";
  return `${visible}${"*".repeat(Math.max(local.length - 1, 1))}@${domain}`;
}

/**
 * Masks PII in an applicant document. ADMIN sees full values (needed for
 * compliance/config work); every other role always gets masked output —
 * this is enforced here, server-side, not left to the frontend to hide.
 */
function maskApplicationData(application, viewerRole = null) {
  const plain =
    typeof application?.toObject === "function" ? application.toObject() : application;
  const cloned = JSON.parse(JSON.stringify(plain));

  if (viewerRole === "ADMIN") return cloned;

  if (cloned?.personalDetails?.panNumber) {
    cloned.personalDetails.panNumber = maskPan(cloned.personalDetails.panNumber);
  }
  if (cloned?.personalDetails?.phone) {
    cloned.personalDetails.phone = maskPhone(cloned.personalDetails.phone);
  }
  if (cloned?.personalDetails?.email) {
    cloned.personalDetails.email = maskEmail(cloned.personalDetails.email);
  }

  return cloned;
}

module.exports = { maskPan, maskPhone, maskEmail, maskApplicationData };

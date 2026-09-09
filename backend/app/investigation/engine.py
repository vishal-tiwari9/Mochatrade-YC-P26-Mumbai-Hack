"""
FraudNexus Investigation & Trace Fraud Service
Implements real graph traversal (BFS/DFS), hop distance calculation,
suspicious relationship detection, shortest path discovery, timeline synthesis,
and session management.
"""

import sqlite3
from collections import deque
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple, Set

from ..db.connection import get_connection
from .graph import InvestigationNode, InvestigationEdge, InvestigationPath, InvestigationGraph


class InvestigationService:
    def __init__(self):
        pass

    def _get_entity_details(self, entity_type: str, entity_id: str, conn: sqlite3.Connection) -> Optional[InvestigationNode]:
        """
        Retrieves a single entity from the database and returns an InvestigationNode.
        """
        cursor = conn.cursor()
        etype = entity_type.upper()

        if etype in ("TRANSACTION", "TXN"):
            cursor.execute("SELECT * FROM transactions WHERE transaction_id = ?", (entity_id,))
            row = cursor.fetchone()
            if not row:
                return None
            r = dict(row)
            cursor.execute("SELECT severity FROM risk_assessments WHERE transaction_id = ?", (entity_id,))
            ra = cursor.fetchone()
            severity = ra["severity"] if ra else ("CRITICAL" if r["amount"] >= 40000 else "LOW")
            return InvestigationNode(
                id=r["transaction_id"],
                type="TRANSACTION",
                label=f"{r['transaction_id']}\n₹{r['amount']:,.0f}",
                risk=severity,
                metadata={
                    "amount": r["amount"],
                    "currency": r.get("currency", "INR"),
                    "timestamp": r["timestamp"],
                    "status": r.get("status", "COMPLETED"),
                    "channel": r.get("channel", "UPI"),
                    "account_id": r.get("account_id"),
                    "device_id": r.get("device_id"),
                    "phone_number": r.get("phone_number"),
                    "upi_id": r.get("upi_id"),
                    "beneficiary_id": r.get("beneficiary_id")
                }
            )

        elif etype in ("ACCOUNT", "ACC"):
            cursor.execute("SELECT * FROM accounts WHERE account_id = ?", (entity_id,))
            row = cursor.fetchone()
            if not row:
                return None
            r = dict(row)
            risk = r.get("risk_tier", "LOW")
            if r.get("is_flagged"):
                risk = "CRITICAL" if risk != "CRITICAL" else risk
            return InvestigationNode(
                id=r["account_id"],
                type="ACCOUNT",
                label=f"{r['account_id']}\n{r['holder_name'].split('(')[0].strip()}",
                risk=risk,
                metadata={
                    "holder_name": r["holder_name"],
                    "risk_tier": r["risk_tier"],
                    "is_flagged": bool(r.get("is_flagged", 0)),
                    "device_id": r.get("device_id"),
                    "phone_number": r.get("phone_number"),
                    "upi_id": r.get("upi_id"),
                    "pan_number": r.get("pan_number"),
                    "created_at": r.get("created_at")
                }
            )

        elif etype in ("DEVICE", "DEV"):
            cursor.execute("SELECT * FROM devices WHERE device_id = ?", (entity_id,))
            row = cursor.fetchone()
            if not row:
                return None
            r = dict(row)
            cursor.execute("SELECT COUNT(*) as cnt FROM accounts WHERE device_id = ?", (entity_id,))
            cnt = cursor.fetchone()["cnt"]
            risk = "CRITICAL" if cnt >= 5 or r.get("is_flagged") else ("HIGH" if cnt >= 3 else "LOW")
            return InvestigationNode(
                id=r["device_id"],
                type="DEVICE",
                label=f"{r['device_id']}\n{r.get('os_info', 'Device').split('/')[0].strip()}",
                risk=risk,
                metadata={
                    "device_fingerprint": r["device_fingerprint"],
                    "os_info": r.get("os_info"),
                    "ip_address": r.get("ip_address"),
                    "is_flagged": bool(r.get("is_flagged", 0)),
                    "first_seen": r.get("first_seen"),
                    "last_seen": r.get("last_seen"),
                    "connected_accounts_count": cnt
                }
            )

        elif etype in ("UPI", "VPA"):
            cursor.execute("SELECT * FROM upis WHERE upi_id = ?", (entity_id,))
            row = cursor.fetchone()
            if not row:
                return None
            r = dict(row)
            risk = "HIGH" if r.get("is_flagged") else "LOW"
            return InvestigationNode(
                id=r["upi_id"],
                type="UPI",
                label=f"{r['upi_id']}\n{r.get('bank_name', 'UPI')}",
                risk=risk,
                metadata={
                    "handle": r.get("handle"),
                    "bank_name": r.get("bank_name"),
                    "is_flagged": bool(r.get("is_flagged", 0))
                }
            )

        elif etype in ("PHONE", "PHN"):
            cursor.execute("SELECT * FROM phones WHERE phone_number = ?", (entity_id,))
            row = cursor.fetchone()
            if not row:
                return None
            r = dict(row)
            risk = "HIGH" if r.get("is_flagged") else "LOW"
            return InvestigationNode(
                id=r["phone_number"],
                type="PHONE",
                label=f"{r['phone_number']}\n{r.get('carrier', 'Carrier')}",
                risk=risk,
                metadata={
                    "carrier": r.get("carrier"),
                    "is_flagged": bool(r.get("is_flagged", 0))
                }
            )

        elif etype in ("BENEFICIARY", "BEN"):
            cursor.execute("SELECT * FROM beneficiaries WHERE beneficiary_id = ?", (entity_id,))
            row = cursor.fetchone()
            if not row:
                return None
            r = dict(row)
            risk = "HIGH" if r.get("is_flagged") else "LOW"
            return InvestigationNode(
                id=r["beneficiary_id"],
                type="BENEFICIARY",
                label=f"{r['beneficiary_id']}\n{r['name'].split('/')[0].strip()}",
                risk=risk,
                metadata={
                    "name": r["name"],
                    "account_number": r.get("account_number"),
                    "ifsc": r.get("ifsc"),
                    "is_flagged": bool(r.get("is_flagged", 0))
                }
            )

        elif etype in ("FRAUD_CASE", "CASE"):
            cursor.execute("SELECT * FROM fraud_cases WHERE case_id = ?", (entity_id,))
            row = cursor.fetchone()
            if not row:
                return None
            r = dict(row)
            return InvestigationNode(
                id=r["case_id"],
                type="FRAUD_CASE",
                label=f"{r['case_id']}\nPolice Dossier",
                risk="CRITICAL",
                metadata={
                    "title": r["title"],
                    "status": r.get("status", "ACTIVE"),
                    "description": r.get("description"),
                    "created_at": r.get("created_at")
                }
            )

        return None

    def auto_detect_entity_type(self, entity_id: str, conn: sqlite3.Connection) -> Optional[Tuple[str, str]]:
        """
        Auto-detects entity type from entity ID format or database presence.
        Returns (entity_type, canonical_id).
        """
        raw = entity_id.strip()
        cursor = conn.cursor()

        cursor.execute("SELECT transaction_id FROM transactions WHERE transaction_id = ?", (raw,))
        if cursor.fetchone():
            return ("TRANSACTION", raw)

        cursor.execute("SELECT account_id FROM accounts WHERE account_id = ?", (raw,))
        if cursor.fetchone():
            return ("ACCOUNT", raw)

        cursor.execute("SELECT device_id FROM devices WHERE device_id = ?", (raw,))
        if cursor.fetchone():
            return ("DEVICE", raw)

        cursor.execute("SELECT upi_id FROM upis WHERE upi_id = ?", (raw,))
        if cursor.fetchone():
            return ("UPI", raw)

        cursor.execute("SELECT phone_number FROM phones WHERE phone_number = ?", (raw,))
        if cursor.fetchone():
            return ("PHONE", raw)

        cursor.execute("SELECT beneficiary_id FROM beneficiaries WHERE beneficiary_id = ?", (raw,))
        if cursor.fetchone():
            return ("BENEFICIARY", raw)

        cursor.execute("SELECT case_id FROM fraud_cases WHERE case_id = ?", (raw,))
        if cursor.fetchone():
            return ("FRAUD_CASE", raw)

        upper = raw.upper()
        if upper.startswith("TXN-"):
            return ("TRANSACTION", raw)
        if upper.startswith("ACC-"):
            return ("ACCOUNT", raw)
        if upper.startswith("DEV-"):
            return ("DEVICE", raw)
        if "@" in raw:
            return ("UPI", raw)
        if raw.startswith("+91") or raw.replace("-", "").isdigit():
            return ("PHONE", raw)
        if upper.startswith("BEN-"):
            return ("BENEFICIARY", raw)
        if upper.startswith("CASE-"):
            return ("FRAUD_CASE", raw)

        return None

    def discover_network(
        self,
        root_type: str,
        root_id: str,
        max_depth: int = 3,
        conn: Optional[sqlite3.Connection] = None
    ) -> InvestigationGraph:
        """
        Real BFS Graph Traversal Engine.
        Discovers connected entities up to max_depth (clamped between 1 and 5).
        Calculates hop distances, identifies suspicious relationships, and synthesizes evidence.
        """
        should_close = False
        if conn is None:
            conn = get_connection()
            should_close = True

        try:
            depth = max(1, min(5, int(max_depth)))

            # Verify and resolve root node
            root_node = self._get_entity_details(root_type, root_id, conn)
            if not root_node:
                detected = self.auto_detect_entity_type(root_id, conn)
                if detected:
                    root_type, root_id = detected
                    root_node = self._get_entity_details(root_type, root_id, conn)

            if not root_node:
                raise ValueError(f"Entity not found for type '{root_type}' and ID '{root_id}'.")

            root_node.hop = 0
            root_node.is_root = True

            nodes_dict: Dict[str, InvestigationNode] = {root_node.id: root_node}
            edges_dict: Dict[str, InvestigationEdge] = {}
            visited_entities: Set[str] = {root_node.id}

            # BFS Queue: (entity_type, entity_id, current_hop)
            queue = deque([(root_node.type, root_node.id, 0)])
            cursor = conn.cursor()

            while queue:
                curr_type, curr_id, curr_hop = queue.popleft()
                if curr_hop >= depth:
                    continue

                neighbors: List[Tuple[str, str, str, str, str, Optional[str], List[str]]] = []

                if curr_type == "TRANSACTION":
                    cursor.execute("SELECT * FROM transactions WHERE transaction_id = ?", (curr_id,))
                    txn_raw = cursor.fetchone()
                    txn = dict(txn_raw) if txn_raw else None
                    if txn:
                        acc_id = txn.get("account_id")
                        if acc_id:
                            neighbors.append((
                                "ACCOUNT", acc_id, "INITIATED_BY", "NORMAL",
                                f"Transaction {curr_id} (₹{txn['amount']:,.0f}) initiated by account {acc_id}",
                                txn["timestamp"], [curr_id]
                            ))
                        dev_id = txn["device_id"]
                        if dev_id:
                            cursor.execute("SELECT COUNT(*) as cnt FROM accounts WHERE device_id = ?", (dev_id,))
                            dev_cnt = cursor.fetchone()["cnt"]
                            susp = "HIGH-RISK" if dev_cnt >= 5 else ("SUSPICIOUS" if dev_cnt >= 3 else "NORMAL")
                            neighbors.append((
                                "DEVICE", dev_id, "USES_DEVICE", susp,
                                f"Transaction {curr_id} captured on hardware {dev_id}. Shared by {dev_cnt} accounts.",
                                txn["timestamp"], [curr_id]
                            ))
                        upi_id = txn["upi_id"]
                        if upi_id:
                            cursor.execute("SELECT is_flagged FROM upis WHERE upi_id = ?", (upi_id,))
                            upi_row = cursor.fetchone()
                            susp = "HIGH-RISK" if (upi_row and upi_row["is_flagged"]) else "NORMAL"
                            neighbors.append((
                                "UPI", upi_id, "USES_UPI", susp,
                                f"Payment routed through UPI VPA {upi_id}",
                                txn["timestamp"], [curr_id]
                            ))
                        phone = txn["phone_number"]
                        if phone:
                            neighbors.append((
                                "PHONE", phone, "REGISTERED_PHONE", "NORMAL",
                                f"Transaction session authenticated via mobile {phone}",
                                txn["timestamp"], [curr_id]
                            ))
                        bene = txn["beneficiary_id"]
                        if bene:
                            cursor.execute("SELECT is_flagged FROM beneficiaries WHERE beneficiary_id = ?", (bene,))
                            bene_row = cursor.fetchone()
                            susp = "HIGH-RISK" if (bene_row and bene_row["is_flagged"]) else "NORMAL"
                            neighbors.append((
                                "BENEFICIARY", bene, "SENDS_TO_BENEFICIARY", susp,
                                f"Settlement designated for beneficiary account {bene}",
                                txn["timestamp"], [curr_id]
                            ))

                elif curr_type == "ACCOUNT":
                    cursor.execute("SELECT * FROM accounts WHERE account_id = ?", (curr_id,))
                    acc_raw = cursor.fetchone()
                    acc = dict(acc_raw) if acc_raw else None
                    if acc:
                        dev_id = acc.get("device_id")
                        if dev_id:
                            cursor.execute("SELECT COUNT(*) as cnt FROM accounts WHERE device_id = ?", (dev_id,))
                            dev_cnt = cursor.fetchone()["cnt"]
                            susp = "HIGH-RISK" if dev_cnt >= 5 else ("SUSPICIOUS" if dev_cnt >= 3 else "NORMAL")
                            neighbors.append((
                                "DEVICE", dev_id, "USES_DEVICE", susp,
                                f"Account {curr_id} bound to device {dev_id} ({dev_cnt} total accounts bound)",
                                acc.get("created_at"), []
                            ))
                        ph = acc["phone_number"]
                        if ph:
                            neighbors.append((
                                "PHONE", ph, "REGISTERED_PHONE", "NORMAL",
                                f"Account {curr_id} registered with phone {ph}",
                                acc.get("created_at"), []
                            ))
                        u_id = acc["upi_id"]
                        if u_id:
                            cursor.execute("SELECT is_flagged FROM upis WHERE upi_id = ?", (u_id,))
                            u_flag = cursor.fetchone()
                            susp = "HIGH-RISK" if (u_flag and u_flag["is_flagged"]) else "NORMAL"
                            neighbors.append((
                                "UPI", u_id, "USES_UPI", susp,
                                f"Account {curr_id} linked with UPI {u_id}",
                                acc.get("created_at"), []
                            ))
                        if dev_id:
                            cursor.execute("SELECT account_id, holder_name, risk_tier FROM accounts WHERE device_id = ? AND account_id != ?", (dev_id, curr_id))
                            siblings = cursor.fetchall()
                            for sib in siblings:
                                neighbors.append((
                                    "ACCOUNT", sib["account_id"], "SHARED_DEVICE", "SUSPICIOUS",
                                    f"Both accounts ({curr_id} and {sib['account_id']}) observed co-authenticating on device {dev_id}",
                                    acc.get("created_at"), []
                                ))
                        cursor.execute("""
                            SELECT c.case_id, c.title, l.reason 
                            FROM case_entity_links l
                            JOIN fraud_cases c ON l.case_id = c.case_id
                            WHERE l.entity_id = ?
                        """, (curr_id,))
                        for c in cursor.fetchall():
                            neighbors.append((
                                "FRAUD_CASE", c["case_id"], "ASSOCIATED_CASE", "HIGH-RISK",
                                f"Account {curr_id} matched in case {c['case_id']}: {c['reason']}",
                                None, []
                            ))
                        cursor.execute("SELECT transaction_id, amount, timestamp, status FROM transactions WHERE account_id = ? ORDER BY timestamp DESC LIMIT 6", (curr_id,))
                        for t in cursor.fetchall():
                            neighbors.append((
                                "TRANSACTION", t["transaction_id"], "RELATED_TXN", "NORMAL",
                                f"Account transaction {t['transaction_id']} (₹{t['amount']:,.0f}) on {t['timestamp']}",
                                t["timestamp"], [t["transaction_id"]]
                            ))

                elif curr_type == "DEVICE":
                    cursor.execute("SELECT account_id, holder_name, risk_tier FROM accounts WHERE device_id = ?", (curr_id,))
                    bound_accs = cursor.fetchall()
                    acc_count = len(bound_accs)
                    susp = "HIGH-RISK" if acc_count >= 5 else ("SUSPICIOUS" if acc_count >= 3 else "NORMAL")
                    for a in bound_accs:
                        neighbors.append((
                            "ACCOUNT", a["account_id"], "USES_DEVICE", susp,
                            f"Hardware {curr_id} actively authenticates account {a['account_id']} ({a['holder_name']}). {acc_count} accounts on device.",
                            None, []
                        ))
                    cursor.execute("""
                        SELECT c.case_id, c.title, l.reason 
                        FROM case_entity_links l
                        JOIN fraud_cases c ON l.case_id = c.case_id
                        WHERE l.entity_id = ?
                    """, (curr_id,))
                    for c in cursor.fetchall():
                        neighbors.append((
                            "FRAUD_CASE", c["case_id"], "ASSOCIATED_CASE", "HIGH-RISK",
                            f"Hardware fingerprint {curr_id} seized in cyber crime case {c['case_id']}: {c['reason']}",
                            None, []
                        ))

                elif curr_type == "UPI":
                    cursor.execute("SELECT account_id, holder_name FROM accounts WHERE upi_id = ?", (curr_id,))
                    for a in cursor.fetchall():
                        neighbors.append((
                            "ACCOUNT", a["account_id"], "USES_UPI", "NORMAL",
                            f"Account {a['account_id']} uses payment handle {curr_id}",
                            None, []
                        ))
                    cursor.execute("SELECT transaction_id, amount, timestamp, account_id FROM transactions WHERE upi_id = ? ORDER BY timestamp DESC LIMIT 8", (curr_id,))
                    txns = cursor.fetchall()
                    for t in txns:
                        neighbors.append((
                            "TRANSACTION", t["transaction_id"], "RELATED_TXN", "NORMAL",
                            f"Inbound transaction {t['transaction_id']} (₹{t['amount']:,.0f}) targeting {curr_id}",
                            t["timestamp"], [t["transaction_id"]]
                        ))
                    cursor.execute("""
                        SELECT c.case_id, c.title, l.reason 
                        FROM case_entity_links l
                        JOIN fraud_cases c ON l.case_id = c.case_id
                        WHERE l.entity_id = ?
                    """, (curr_id,))
                    for c in cursor.fetchall():
                        neighbors.append((
                            "FRAUD_CASE", c["case_id"], "ASSOCIATED_CASE", "HIGH-RISK",
                            f"Virtual payment address {curr_id} flagged in cyber crime case {c['case_id']}: {c['reason']}",
                            None, []
                        ))

                elif curr_type == "PHONE":
                    cursor.execute("SELECT account_id, holder_name FROM accounts WHERE phone_number = ?", (curr_id,))
                    for a in cursor.fetchall():
                        neighbors.append((
                            "ACCOUNT", a["account_id"], "REGISTERED_PHONE", "NORMAL",
                            f"Account {a['account_id']} registered under mobile number {curr_id}",
                            None, []
                        ))
                    cursor.execute("""
                        SELECT c.case_id, c.title, l.reason 
                        FROM case_entity_links l
                        JOIN fraud_cases c ON l.case_id = c.case_id
                        WHERE l.entity_id = ?
                    """, (curr_id,))
                    for c in cursor.fetchall():
                        neighbors.append((
                            "FRAUD_CASE", c["case_id"], "ASSOCIATED_CASE", "HIGH-RISK",
                            f"Phone {curr_id} linked in {c['case_id']}: {c['reason']}",
                            None, []
                        ))

                elif curr_type == "BENEFICIARY":
                    cursor.execute("SELECT transaction_id, account_id, amount, timestamp FROM transactions WHERE beneficiary_id = ? ORDER BY timestamp DESC LIMIT 6", (curr_id,))
                    for t in cursor.fetchall():
                        neighbors.append((
                            "TRANSACTION", t["transaction_id"], "SENDS_TO_BENEFICIARY", "NORMAL",
                            f"Funds funneled to {curr_id} via transaction {t['transaction_id']} (₹{t['amount']:,.0f})",
                            t["timestamp"], [t["transaction_id"]]
                        ))
                    cursor.execute("""
                        SELECT c.case_id, c.title, l.reason 
                        FROM case_entity_links l
                        JOIN fraud_cases c ON l.case_id = c.case_id
                        WHERE l.entity_id = ?
                    """, (curr_id,))
                    for c in cursor.fetchall():
                        neighbors.append((
                            "FRAUD_CASE", c["case_id"], "ASSOCIATED_CASE", "HIGH-RISK",
                            f"Beneficiary {curr_id} identified in case {c['case_id']}: {c['reason']}",
                            None, []
                        ))

                elif curr_type == "FRAUD_CASE":
                    cursor.execute("SELECT entity_type, entity_id, reason FROM case_entity_links WHERE case_id = ?", (curr_id,))
                    for l in cursor.fetchall():
                        e_type = l["entity_type"].upper()
                        if e_type == "ACCOUNT": et = "ACCOUNT"
                        elif e_type == "DEVICE": et = "DEVICE"
                        elif e_type == "UPI": et = "UPI"
                        elif e_type == "PHONE": et = "PHONE"
                        elif e_type == "TRANSACTION": et = "TRANSACTION"
                        elif e_type == "BENEFICIARY": et = "BENEFICIARY"
                        else: et = "ACCOUNT"
                        neighbors.append((
                            et, l["entity_id"], "ASSOCIATED_CASE", "HIGH-RISK",
                            f"Subject of law enforcement FIR {curr_id}: {l['reason']}",
                            None, []
                        ))

                for tgt_type, tgt_id, edge_type, susp, evidence, ts, txn_ids in neighbors:
                    edge_key = f"{curr_id}-->{tgt_id}::{edge_type}"
                    rev_edge_key = f"{tgt_id}-->{curr_id}::{edge_type}"

                    if edge_key not in edges_dict and rev_edge_key not in edges_dict:
                        edges_dict[edge_key] = InvestigationEdge(
                            id=f"EDGE-{len(edges_dict)+1:03d}",
                            source=curr_id,
                            target=tgt_id,
                            type=edge_type,
                            suspiciousness=susp,
                            evidence=evidence,
                            timestamp=ts,
                            supporting_transactions=txn_ids,
                            risk=susp
                        )

                    if tgt_id not in nodes_dict:
                        target_node = self._get_entity_details(tgt_type, tgt_id, conn)
                        if target_node:
                            target_node.hop = curr_hop + 1
                            nodes_dict[tgt_id] = target_node
                            if tgt_id not in visited_entities:
                                visited_entities.add(tgt_id)
                                queue.append((tgt_type, tgt_id, curr_hop + 1))

            nodes_list = list(nodes_dict.values())
            edges_list = list(edges_dict.values())

            paths: List[InvestigationPath] = []
            fraud_case_nodes = [n for n in nodes_list if n.type == "FRAUD_CASE"]
            for fc in fraud_case_nodes:
                p = self._find_path_in_subgraph(root_node.id, fc.id, nodes_dict, edges_list)
                if p:
                    paths.append(p)

            if not paths and len(nodes_list) > 1:
                critical_nodes = [n for n in nodes_list if n.id != root_node.id and n.risk in ("CRITICAL", "HIGH")]
                if critical_nodes:
                    target = critical_nodes[0]
                    p = self._find_path_in_subgraph(root_node.id, target.id, nodes_dict, edges_list)
                    if p:
                        paths.append(p)

            summary = self._synthesize_summary(root_node, nodes_list, edges_list, paths)
            investigation_id = f"INV-2026-{abs(hash(root_node.id)) % 900 + 100:03d}"

            return InvestigationGraph(
                investigation_id=investigation_id,
                root=root_node.to_dict(),
                depth=depth,
                nodes=nodes_list,
                edges=edges_list,
                paths=paths,
                risk_summary=summary
            )

        finally:
            if should_close:
                conn.close()

    def _find_path_in_subgraph(
        self,
        source_id: str,
        target_id: str,
        nodes_dict: Dict[str, InvestigationNode],
        edges: List[InvestigationEdge]
    ) -> Optional[InvestigationPath]:
        adj: Dict[str, List[Tuple[str, InvestigationEdge]]] = {}
        for n in nodes_dict:
            adj[n] = []

        for e in edges:
            if e.source in adj and e.target in adj:
                adj[e.source].append((e.target, e))
                adj[e.target].append((e.source, e))

        visited = {source_id}
        queue = deque([source_id])
        parents: Dict[str, Tuple[str, InvestigationEdge]] = {}

        found = False
        while queue:
            curr = queue.popleft()
            if curr == target_id:
                found = True
                break

            neighbors = adj.get(curr, [])
            neighbors.sort(key=lambda item: 0 if item[1].suspiciousness == "HIGH-RISK" else (1 if item[1].suspiciousness == "SUSPICIOUS" else 2))

            for nxt, edge in neighbors:
                if nxt not in visited:
                    visited.add(nxt)
                    parents[nxt] = (curr, edge)
                    queue.append(nxt)

        if not found:
            return None

        path_nodes: List[Dict[str, Any]] = []
        path_edges: List[Dict[str, Any]] = []
        curr = target_id

        while curr != source_id:
            path_nodes.append(nodes_dict[curr].to_dict())
            prev, edge = parents[curr]
            path_edges.append(edge.to_dict())
            curr = prev

        path_nodes.append(nodes_dict[source_id].to_dict())
        path_nodes.reverse()
        path_edges.reverse()

        labels = [f"{n['id']} ({n['type']})" for n in path_nodes]
        chain_desc = " → ".join(labels)

        return InvestigationPath(
            source_id=source_id,
            target_id=target_id,
            nodes=path_nodes,
            edges=path_edges,
            hop_count=len(path_edges),
            description=chain_desc,
            is_suspicious=any(e["suspiciousness"] in ("HIGH-RISK", "SUSPICIOUS") for e in path_edges)
        )

    def find_shortest_suspicious_path(self, source_id: str, target_id: str, conn: Optional[sqlite3.Connection] = None) -> Optional[Dict[str, Any]]:
        should_close = False
        if conn is None:
            conn = get_connection()
            should_close = True

        try:
            detected_src = self.auto_detect_entity_type(source_id, conn)
            detected_tgt = self.auto_detect_entity_type(target_id, conn)
            if not detected_src or not detected_tgt:
                return None

            graph = self.discover_network(detected_src[0], detected_src[1], max_depth=4, conn=conn)
            nodes_map = {n.id: n for n in graph.nodes}

            if detected_tgt[1] not in nodes_map:
                tgt_graph = self.discover_network(detected_tgt[0], detected_tgt[1], max_depth=2, conn=conn)
                for n in tgt_graph.nodes:
                    if n.id not in nodes_map:
                        nodes_map[n.id] = n
                graph.edges.extend(tgt_graph.edges)

            path = self._find_path_in_subgraph(detected_src[1], detected_tgt[1], nodes_map, graph.edges)
            return path.to_dict() if path else None
        finally:
            if should_close:
                conn.close()

    def expand_entity_connections(
        self,
        entity_type: str,
        entity_id: str,
        existing_node_ids: Optional[List[str]] = None,
        conn: Optional[sqlite3.Connection] = None
    ) -> Dict[str, Any]:
        should_close = False
        if conn is None:
            conn = get_connection()
            should_close = True

        try:
            existing = set(existing_node_ids or [])
            graph = self.discover_network(entity_type, entity_id, max_depth=1, conn=conn)

            new_nodes = [n.to_dict() for n in graph.nodes if n.id not in existing]
            new_edges = [e.to_dict() for e in graph.edges]

            return {
                "entity_id": entity_id,
                "entity_type": entity_type,
                "new_nodes_count": len(new_nodes),
                "new_edges_count": len(new_edges),
                "nodes": new_nodes,
                "edges": new_edges
            }
        finally:
            if should_close:
                conn.close()

    def get_account_transaction_history(self, account_id: str, limit: int = 20, conn: Optional[sqlite3.Connection] = None) -> List[Dict[str, Any]]:
        should_close = False
        if conn is None:
            conn = get_connection()
            should_close = True

        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT t.*, b.name as beneficiary_name
                FROM transactions t
                LEFT JOIN beneficiaries b ON t.beneficiary_id = b.beneficiary_id
                WHERE t.account_id = ?
                ORDER BY t.timestamp DESC
                LIMIT ?
            """, (account_id, limit))

            rows = cursor.fetchall()
            history = []
            for r_raw in rows:
                r = dict(r_raw)
                amt = r["amount"]
                risk = "CRITICAL" if amt >= 40000 else ("HIGH" if amt >= 20000 else ("MEDIUM" if amt >= 10000 else "LOW"))
                history.append({
                    "transaction_id": r["transaction_id"],
                    "timestamp": r["timestamp"],
                    "amount": amt,
                    "currency": r.get("currency", "INR"),
                    "beneficiary": r.get("beneficiary_name") or r.get("beneficiary_id") or "Direct Settlement",
                    "beneficiary_id": r.get("beneficiary_id"),
                    "status": r.get("status", "COMPLETED"),
                    "risk_tier": risk
                })
            return history
        finally:
            if should_close:
                conn.close()

    def get_investigation_timeline(self, root_id: str, conn: Optional[sqlite3.Connection] = None) -> List[Dict[str, Any]]:
        should_close = False
        if conn is None:
            conn = get_connection()
            should_close = True

        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM timeline_events WHERE transaction_id = ? ORDER BY timestamp ASC", (root_id,))
            events = [dict(r) for r in cursor.fetchall()]
            if events:
                return events

            cursor.execute("SELECT * FROM transactions WHERE account_id = ? OR transaction_id = ? ORDER BY timestamp ASC LIMIT 15", (root_id, root_id))
            txns = cursor.fetchall()
            synthesized = []
            for idx, t_raw in enumerate(txns):
                t = dict(t_raw)
                synthesized.append({
                    "event_id": f"EVT-{idx+1:02d}",
                    "transaction_id": t["transaction_id"],
                    "timestamp": t["timestamp"],
                    "title": f"Transaction of ₹{t['amount']:,.0f} Processed",
                    "description": f"Fund routing via {t.get('channel', 'UPI')} from account {t['account_id']} targeting {t.get('beneficiary_id') or t.get('upi_id')}",
                    "category": "TRANSACTION",
                    "severity": "CRITICAL" if t["amount"] >= 40000 else "NORMAL"
                })
            return synthesized
        finally:
            if should_close:
                conn.close()

    def _synthesize_summary(
        self,
        root_node: InvestigationNode,
        nodes: List[InvestigationNode],
        edges: List[InvestigationEdge],
        paths: List[InvestigationPath]
    ) -> Dict[str, Any]:
        total_nodes = len(nodes)
        total_edges = len(edges)
        suspicious_edges = [e for e in edges if e.suspiciousness in ("SUSPICIOUS", "HIGH-RISK")]
        fraud_case_nodes = [n for n in nodes if n.type == "FRAUD_CASE"]
        shared_devices = [n for n in nodes if n.type == "DEVICE" and n.metadata.get("connected_accounts_count", 0) >= 3]

        paragraphs: List[str] = []

        if len(suspicious_edges) == 0 and len(fraud_case_nodes) == 0 and len(shared_devices) == 0:
            paragraphs.append(
                f"Investigation initiated from root entity {root_node.id} ({root_node.type}). "
                f"Traversal discovered {total_nodes} connected entities across {total_edges} relationships. "
                f"All evaluated edges satisfy baseline compliance parameters. "
                f"No shared hardware multi-tenancy or prior law enforcement links identified."
            )
            return {
                "status": "NO_SIGNIFICANT_SUSPICIOUS_CONNECTIONS",
                "headline": "NO SIGNIFICANT SUSPICIOUS CONNECTIONS FOUND",
                "narrative": "\n\n".join(paragraphs),
                "total_entities": total_nodes,
                "total_relationships": total_edges,
                "suspicious_connections_count": 0,
                "previous_fraud_links_count": 0,
                "shared_devices_count": 0,
                "max_hop_distance": max((n.hop for n in nodes), default=0)
            }

        if root_node.type == "TRANSACTION" and not root_node.metadata.get("device_id") and not root_node.metadata.get("phone_number"):
            paragraphs.append(
                f"Investigation opened for {root_node.id}. "
                f"Hardware telemetry and mobile device binding data are unavailable in database records for this transaction. "
                f"System integrity preserved: no synthetic connections generated."
            )
            return {
                "status": "LIMITED_INVESTIGATION_DATA",
                "headline": "LIMITED INVESTIGATION DATA",
                "narrative": "\n\n".join(paragraphs),
                "total_entities": total_nodes,
                "total_relationships": total_edges,
                "suspicious_connections_count": 0,
                "previous_fraud_links_count": 0,
                "shared_devices_count": 0,
                "max_hop_distance": 1
            }

        paragraphs.append(
            f"Investigation opened from root entity {root_node.id} ({root_node.type}, Risk: {root_node.risk}). "
            f"Automated relationship discovery uncovered {total_nodes} interconnected entities across {total_edges} verified edges."
        )

        if shared_devices:
            for dev in shared_devices:
                cnt = dev.metadata.get("connected_accounts_count", 0)
                paragraphs.append(
                    f"Shared hardware multi-tenancy confirmed on device {dev.id} ({dev.metadata.get('os_info', 'Device')}). "
                    f"This single hardware signature is bound across {cnt} distinct accounts, indicating organized mule syndication."
                )

        if fraud_case_nodes:
            case_titles = [f"{c.id} ({c.metadata.get('title', 'Active Police FIR')})" for c in fraud_case_nodes]
            paragraphs.append(
                f"Active law enforcement dossier matched: {', '.join(case_titles)}. "
                f"Entities in this network are subject to formal cybercrime records."
            )

        if paths:
            best_path = paths[0]
            paragraphs.append(
                f"Shortest suspicious path established across {best_path.hop_count} hops: {best_path.description}."
            )

        paragraphs.append("Coordinated syndicate activity detected. Recommend immediate account suspension and evidence freeze.")

        return {
            "status": "SUSPICIOUS_NETWORK_DETECTED",
            "headline": f"{len(suspicious_edges)} SUSPICIOUS CONNECTIONS DETECTED",
            "narrative": "\n\n".join(paragraphs),
            "total_entities": total_nodes,
            "total_relationships": total_edges,
            "suspicious_connections_count": len(suspicious_edges),
            "previous_fraud_links_count": len(fraud_case_nodes),
            "shared_devices_count": len(shared_devices),
            "max_hop_distance": max((n.hop for n in nodes), default=0)
        }

    def get_or_create_session(self, root_id: str, root_type: str, conn: Optional[sqlite3.Connection] = None) -> Dict[str, Any]:
        should_close = False
        if conn is None:
            conn = get_connection()
            should_close = True

        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM investigation_sessions WHERE root_id = ? ORDER BY created_at DESC LIMIT 1", (root_id,))
            session = cursor.fetchone()
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            if not session:
                inv_id = f"INV-2026-{abs(hash(root_id)) % 900 + 100:03d}"
                title = f"Syndicate Trace — {root_type} {root_id}"
                cursor.execute("""
                    INSERT INTO investigation_sessions (investigation_id, root_id, root_type, title, created_at, status)
                    VALUES (?, ?, ?, ?, ?, 'OPEN')
                """, (inv_id, root_id, root_type, title, now))
                self.log_audit(inv_id, "INVESTIGATION_STARTED", root_id, f"Investigation initiated from root {root_type} {root_id}", conn)
                conn.commit()
                return {
                    "investigation_id": inv_id,
                    "root_id": root_id,
                    "root_type": root_type,
                    "title": title,
                    "created_at": now,
                    "status": "OPEN"
                }

            return dict(session)
        finally:
            if should_close:
                conn.close()

    def add_note(self, investigation_id: str, note_text: str, author: str = "Lead Investigator", conn: Optional[sqlite3.Connection] = None) -> Dict[str, Any]:
        should_close = False
        if conn is None:
            conn = get_connection()
            should_close = True

        try:
            cursor = conn.cursor()
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("""
                INSERT INTO investigation_notes (investigation_id, note_text, author, created_at)
                VALUES (?, ?, ?, ?)
            """, (investigation_id, note_text, author, now))
            note_id = cursor.lastrowid
            self.log_audit(investigation_id, "NOTE_ADDED", None, f"Note added: {note_text[:40]}...", conn)
            conn.commit()
            return {"id": note_id, "investigation_id": investigation_id, "note_text": note_text, "author": author, "created_at": now}
        finally:
            if should_close:
                conn.close()

    def add_finding(self, investigation_id: str, item_type: str, item_id: str, label: str, reason: Optional[str] = None, conn: Optional[sqlite3.Connection] = None) -> Dict[str, Any]:
        should_close = False
        if conn is None:
            conn = get_connection()
            should_close = True

        try:
            cursor = conn.cursor()
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("""
                INSERT INTO investigation_findings (investigation_id, item_type, item_id, label, is_important, reason, added_at)
                VALUES (?, ?, ?, ?, 1, ?, ?)
            """, (investigation_id, item_type, item_id, label, reason or "Marked as critical lead by investigator", now))
            fid = cursor.lastrowid
            self.log_audit(investigation_id, "ENTITY_MARKED_IMPORTANT", item_id, f"Marked {item_type} {item_id} ({label}) as Important Finding", conn)
            conn.commit()
            return {"id": fid, "investigation_id": investigation_id, "item_type": item_type, "item_id": item_id, "label": label, "added_at": now}
        finally:
            if should_close:
                conn.close()

    def add_evidence(self, investigation_id: str, title: str, details: str, source: str, conn: Optional[sqlite3.Connection] = None) -> Dict[str, Any]:
        should_close = False
        if conn is None:
            conn = get_connection()
            should_close = True

        try:
            cursor = conn.cursor()
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("""
                INSERT INTO investigation_evidence (investigation_id, title, details, source, timestamp)
                VALUES (?, ?, ?, ?, ?)
            """, (investigation_id, title, details, source, now))
            eid = cursor.lastrowid
            self.log_audit(investigation_id, "EVIDENCE_ADDED", None, f"Evidence registered: {title}", conn)
            conn.commit()
            return {"id": eid, "investigation_id": investigation_id, "title": title, "details": details, "source": source, "timestamp": now}
        finally:
            if should_close:
                conn.close()

    def log_audit(self, investigation_id: str, action_type: str, entity_id: Optional[str], details: str, conn: Optional[sqlite3.Connection] = None) -> None:
        should_close = False
        if conn is None:
            conn = get_connection()
            should_close = True

        try:
            cursor = conn.cursor()
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            cursor.execute("SELECT investigation_id FROM investigation_sessions WHERE investigation_id = ?", (investigation_id,))
            if not cursor.fetchone():
                cursor.execute("""
                    INSERT OR IGNORE INTO investigation_sessions (investigation_id, root_id, root_type, title, created_at, status)
                    VALUES (?, ?, 'ENTITY', 'Auto Created Session', ?, 'OPEN')
                """, (investigation_id, entity_id or investigation_id, now))

            cursor.execute("""
                INSERT INTO investigation_audit_logs (investigation_id, action_type, entity_id, details, timestamp)
                VALUES (?, ?, ?, ?, ?)
            """, (investigation_id, action_type, entity_id, details, now))
            conn.commit()
        finally:
            if should_close:
                conn.close()

    def get_session_details(self, investigation_id: str, conn: Optional[sqlite3.Connection] = None) -> Dict[str, Any]:
        should_close = False
        if conn is None:
            conn = get_connection()
            should_close = True

        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM investigation_sessions WHERE investigation_id = ?", (investigation_id,))
            sess = cursor.fetchone()
            if not sess:
                return {}

            cursor.execute("SELECT * FROM investigation_notes WHERE investigation_id = ? ORDER BY created_at DESC", (investigation_id,))
            notes = [dict(r) for r in cursor.fetchall()]

            cursor.execute("SELECT * FROM investigation_findings WHERE investigation_id = ? ORDER BY added_at DESC", (investigation_id,))
            findings = [dict(r) for r in cursor.fetchall()]

            cursor.execute("SELECT * FROM investigation_evidence WHERE investigation_id = ? ORDER BY timestamp DESC", (investigation_id,))
            evidence = [dict(r) for r in cursor.fetchall()]

            cursor.execute("SELECT * FROM investigation_audit_logs WHERE investigation_id = ? ORDER BY timestamp DESC LIMIT 30", (investigation_id,))
            logs = [dict(r) for r in cursor.fetchall()]

            res = dict(sess)
            res["notes"] = notes
            res["findings"] = findings
            res["evidence"] = evidence
            res["audit_logs"] = logs
            return res
        finally:
            if should_close:
                conn.close()

    def search_entities(self, query: str, limit: int = 15, conn: Optional[sqlite3.Connection] = None) -> List[Dict[str, Any]]:
        should_close = False
        if conn is None:
            conn = get_connection()
            should_close = True

        try:
            cursor = conn.cursor()
            q = f"%{query.strip()}%"
            results = []

            cursor.execute("SELECT transaction_id, amount, timestamp FROM transactions WHERE transaction_id LIKE ? LIMIT 5", (q,))
            for r in cursor.fetchall():
                r = dict(r)
                results.append({"id": r["transaction_id"], "type": "TRANSACTION", "label": f"{r['transaction_id']} (₹{r['amount']:,.0f})", "risk": "CRITICAL"})

            cursor.execute("SELECT account_id, holder_name, risk_tier FROM accounts WHERE account_id LIKE ? OR holder_name LIKE ? LIMIT 5", (q, q))
            for r in cursor.fetchall():
                r = dict(r)
                results.append({"id": r["account_id"], "type": "ACCOUNT", "label": f"{r['account_id']} — {r['holder_name']}", "risk": r["risk_tier"]})

            cursor.execute("SELECT device_id, os_info FROM devices WHERE device_id LIKE ? LIMIT 4", (q,))
            for r in cursor.fetchall():
                r = dict(r)
                results.append({"id": r["device_id"], "type": "DEVICE", "label": f"{r['device_id']} ({r.get('os_info', 'Device')})", "risk": "HIGH"})

            cursor.execute("SELECT upi_id, bank_name FROM upis WHERE upi_id LIKE ? LIMIT 4", (q,))
            for r in cursor.fetchall():
                r = dict(r)
                results.append({"id": r["upi_id"], "type": "UPI", "label": f"{r['upi_id']} ({r.get('bank_name', 'UPI')})", "risk": "HIGH"})

            cursor.execute("SELECT phone_number, carrier FROM phones WHERE phone_number LIKE ? LIMIT 4", (q,))
            for r in cursor.fetchall():
                r = dict(r)
                results.append({"id": r["phone_number"], "type": "PHONE", "label": f"{r['phone_number']} ({r.get('carrier', 'Carrier')})", "risk": "NORMAL"})

            cursor.execute("SELECT beneficiary_id, name FROM beneficiaries WHERE beneficiary_id LIKE ? OR name LIKE ? LIMIT 4", (q, q))
            for r in cursor.fetchall():
                r = dict(r)
                results.append({"id": r["beneficiary_id"], "type": "BENEFICIARY", "label": f"{r['beneficiary_id']} ({r['name']})", "risk": "HIGH"})

            cursor.execute("SELECT case_id, title FROM fraud_cases WHERE case_id LIKE ? OR title LIKE ? LIMIT 4", (q, q))
            for r in cursor.fetchall():
                r = dict(r)
                results.append({"id": r["case_id"], "type": "FRAUD_CASE", "label": f"{r['case_id']}: {r['title'][:30]}...", "risk": "CRITICAL"})

            return results[:limit]
        finally:
            if should_close:
                conn.close()

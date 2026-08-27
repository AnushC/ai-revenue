import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

export const getDashboardAnalytics = () =>
    api.get("/analytics/dashboard");

export const getRevenueRisks = () =>
    api.get("/revenue-risks");

export const getRevenueRisk = (id) =>
    api.get(`/revenue-risks/${id}`);

export const runRecoveryWorkflow = (id) =>
    api.post(`/workflows/run/${id}`);

export const runBatchRecovery = () =>
    api.post("/workflows/run-batch");

export const analyzeRisk = (id) =>
    api.post(`/ai/analyze/${id}`);

export const getAuditLogs = (id) =>
    api.get(`/recovery/${id}/audit`);

export default api;
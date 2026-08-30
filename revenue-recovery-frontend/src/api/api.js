import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Automatically attach JWT to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,

    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);
// Authentication
export const login = (data) =>
    api.post("/auth/login", data);

export const register = (data) =>
    api.post("/auth/register", data);

// Dashboard
export const getDashboardAnalytics = () =>
    api.get("/analytics/dashboard");

export const getRecoveryTrend = () =>
    api.get("/analytics/recovery-trend");

// Risks
export const getRevenueRisks = () =>
    api.get("/revenue-risks");

export const getRevenueRisk = (id) =>
    api.get(`/revenue-risks/${id}`);

// AI
export const analyzeRisk = (id) =>
    api.post(`/ai/analyze/${id}`);

// Recovery
export const runRecoveryWorkflow = (id) =>
    api.post(`/workflows/run/${id}`);

export const runBatchRecovery = () =>
    api.post("/workflows/run-batch");

// Audit
export const getAuditLogs = (id) =>
    api.get(`/recovery/${id}/audit`);

export const getAllAuditLogs = () =>
    api.get("/recovery/audit/all");

export const getHumanReviews = () =>
    api.get("/human-review");

export const escalateToHumanReview = (id) =>
    api.post(`/human-review/${id}/escalate`);

export const approveHumanReview = (id) =>
    api.post(`/human-review/${id}/approve`);

export const rejectHumanReview = (id) =>
    api.post(`/human-review/${id}/reject`);

export default api;
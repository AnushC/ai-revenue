import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

/*
 * ============================================================
 * REQUEST INTERCEPTOR
 * Attach JWT to every protected request
 * ============================================================
 */

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/*
 * ============================================================
 * RESPONSE INTERCEPTOR
 * ============================================================
 */

api.interceptors.response.use(
    (response) => response,

    (error) => {
        const status = error.response?.status;

        /*
         * If token is missing / expired / invalid
         */
        if (status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }

        /*
         * Keep 403 responses available to the page so
         * the actual backend message can be displayed.
         */
        if (status === 403) {
            console.error(
                "Forbidden request:",
                error.config?.url
            );

            console.error(
                "Backend response:",
                error.response?.data
            );
        }

        return Promise.reject(error);
    }
);

/*
 * ============================================================
 * AUTHENTICATION
 * ============================================================
 */

export const login = (data) =>
    api.post("/auth/login", data);

export const register = (data) =>
    api.post("/auth/register", data);


/*
 * ============================================================
 * DASHBOARD
 * ============================================================
 */

export const getDashboardAnalytics = () =>
    api.get("/analytics/dashboard");

export const getRecoveryTrend = () =>
    api.get("/analytics/recovery-trend");


/*
 * ============================================================
 * REVENUE RISKS
 * ============================================================
 */

export const getRevenueRisks = () =>
    api.get("/revenue-risks");

export const getRevenueRisk = (id) =>
    api.get(`/revenue-risks/${id}`);


/*
 * ============================================================
 * AI
 * ============================================================
 */

export const analyzeRisk = (id) =>
    api.post(`/ai/analyze/${id}`);


/*
 * ============================================================
 * RECOVERY WORKFLOW
 * ============================================================
 */

export const runRecoveryWorkflow = (id) =>
    api.post(`/workflows/run/${id}`);

export const runBatchRecovery = () =>
    api.post("/workflows/run-batch");


/*
 * ============================================================
 * AUDIT LOGS
 * ============================================================
 */

export const getAuditLogs = (id) =>
    api.get(`/recovery/${id}/audit`);

export const getAllAuditLogs = () =>
    api.get("/recovery/audit/all");


/*
 * ============================================================
 * HUMAN REVIEW
 * ============================================================
 */

export const getHumanReviews = () =>
    api.get("/human-review");

export const escalateToHumanReview = (id) =>
    api.post(`/human-review/${id}/escalate`);

export const approveHumanReview = (id) =>
    api.post(`/human-review/${id}/approve`);

export const rejectHumanReview = (id) =>
    api.post(`/human-review/${id}/reject`);


/*
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */

export default api;
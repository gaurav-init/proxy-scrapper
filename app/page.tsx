"use client";

import { useState, useEffect, useCallback } from "react";

interface Proxy {
  _id: string;
  ip: string;
  port: number;
  type: string;
  status: string;
  source: string;
  lastCommit: string | null;
  scrapedAt: string;
}

interface Stats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  activeByType: Record<string, number>;
}

function timeAgo(dateStr: string | null) {
  if (!dateStr) return "-";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins + "m ago";
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + "h ago";
  const days = Math.floor(hrs / 24);
  return days + "d ago";
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [proxies, setProxies] = useState<Proxy[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(0);
  const [currentType, setCurrentType] = useState("");
  const [currentStatus, setCurrentStatus] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const LIMIT = 50;

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Failed to load stats:", e);
    }
  }, []);

  const loadProxies = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(currentPage), limit: String(LIMIT) });
    if (currentType) params.set("type", currentType);
    if (currentStatus) params.set("status", currentStatus);

    try {
      const res = await fetch("/api/proxies?" + params);
      const data = await res.json();
      setProxies(data.proxies);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) {
      console.error("Failed to load proxies:", e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentType, currentStatus]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadProxies();
  }, [loadProxies]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      loadStats();
      loadProxies();
    }, 300000);
    return () => clearInterval(interval);
  }, [loadStats, loadProxies]);

  function handleType(type: string) {
    setCurrentType(type);
    setCurrentPage(1);
  }

  function handleStatus(status: string) {
    setCurrentStatus(status);
    setCurrentPage(1);
  }

  function copyProxy(ip: string, port: number, id: string) {
    navigator.clipboard.writeText(ip + ":" + port);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  const typeFilters = [
    { label: "All Types", value: "", cls: "" },
    { label: "HTTP", value: "http", cls: "http" },
    { label: "HTTPS", value: "https", cls: "https" },
    { label: "SOCKS4", value: "socks4", cls: "socks4" },
    { label: "SOCKS5", value: "socks5", cls: "socks5" },
  ];

  const statusFilters = [
    { label: "Active", value: "active", cls: "active-btn" },
    { label: "Inactive", value: "inactive", cls: "inactive-btn" },
    { label: "All", value: "", cls: "all-btn" },
  ];

  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(pages, currentPage + 2);
  const pageButtons = [];
  for (let p = startPage; p <= endPage; p++) pageButtons.push(p);

  return (
    <>
      <div className="header">
        <h1>Verifox Proxy Dashboard</h1>
        <p>Free proxies scraped from GitHub — updated every hour</p>
        {proxies.length > 0 && proxies[0].scrapedAt && (
          <div className="last-update">
            Last scraped: {new Date(proxies[0].scrapedAt).toLocaleString()}
          </div>
        )}
      </div>

      <div className="container">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="value">{stats ? stats.total.toLocaleString() : "-"}</div>
            <div className="label">Total Proxies</div>
          </div>
          <div className="stat-card active">
            <div className="value">{stats ? (stats.byStatus.active || 0).toLocaleString() : "-"}</div>
            <div className="label">Active</div>
          </div>
          <div className="stat-card inactive">
            <div className="value">{stats ? (stats.byStatus.inactive || 0).toLocaleString() : "-"}</div>
            <div className="label">Inactive</div>
          </div>
          <div className="stat-card">
            <div className="value">{stats ? (stats.activeByType.http || 0).toLocaleString() : "-"}</div>
            <div className="label">HTTP</div>
          </div>
          <div className="stat-card">
            <div className="value">{stats ? (stats.activeByType.https || 0).toLocaleString() : "-"}</div>
            <div className="label">HTTPS</div>
          </div>
          <div className="stat-card">
            <div className="value">{stats ? (stats.activeByType.socks4 || 0).toLocaleString() : "-"}</div>
            <div className="label">SOCKS4</div>
          </div>
          <div className="stat-card">
            <div className="value">{stats ? (stats.activeByType.socks5 || 0).toLocaleString() : "-"}</div>
            <div className="label">SOCKS5</div>
          </div>
        </div>

        {/* Filters */}
        <div className="controls">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              className={`filter-btn ${f.cls} ${currentType === f.value ? "selected" : ""}`}
              onClick={() => handleType(f.value)}
            >
              {f.label}
            </button>
          ))}
          <div className="status-toggle">
            {statusFilters.map((f) => (
              <button
                key={f.value}
                className={`status-btn ${f.cls} ${currentStatus === f.value ? "selected" : ""}`}
                onClick={() => handleStatus(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>IP Address</th>
                <th>Port</th>
                <th>Type</th>
                <th>Status</th>
                <th>Source</th>
                <th>Last Commit</th>
                <th>Copy</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="loading">Loading proxies...</td>
                </tr>
              ) : proxies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="loading">No proxies found</td>
                </tr>
              ) : (
                proxies.map((p, i) => (
                  <tr key={p._id}>
                    <td style={{ color: "#8b949e" }}>{(currentPage - 1) * LIMIT + i + 1}</td>
                    <td>{p.ip}</td>
                    <td>{p.port}</td>
                    <td><span className={`badge-type ${p.type}`}>{p.type}</span></td>
                    <td><span className={`badge ${p.status}`}>{p.status}</span></td>
                    <td className="source-link">{p.source}</td>
                    <td style={{ color: "#8b949e" }}>{timeAgo(p.lastCommit)}</td>
                    <td>
                      <button
                        className={`copy-btn ${copiedId === p._id ? "copied" : ""}`}
                        onClick={() => copyProxy(p.ip, p.port, p._id)}
                      >
                        {copiedId === p._id ? "Copied!" : "Copy"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={currentPage <= 1}
              onClick={() => { setCurrentPage(currentPage - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              Prev
            </button>
            {pageButtons.map((p) => (
              <button
                key={p}
                className={`page-btn ${p === currentPage ? "current" : ""}`}
                onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              >
                {p}
              </button>
            ))}
            <span className="page-info">{total.toLocaleString()} proxies</span>
            <button
              className="page-btn"
              disabled={currentPage >= pages}
              onClick={() => { setCurrentPage(currentPage + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
}

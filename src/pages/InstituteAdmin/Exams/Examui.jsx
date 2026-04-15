// ExamUI.jsx  —  shared low-level components for Exam pages
import React, { useState } from "react";
import { BRAND } from "./Examstorage";

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  inputBase: (err) => ({
    width: "100%",
    border: `1px solid ${err ? "#fca5a5" : "#d1d5db"}`,
    borderRadius: 8,
    padding: "9px 12px",
    fontSize: 13,
    outline: "none",
    background: err ? "#fff5f5" : "#fff",
    color: "#111827",
    transition: "border-color .15s, box-shadow .15s",
    fontFamily: "inherit",
  }),
};

const onFocus = (e) => {
  e.target.style.borderColor = BRAND;
  e.target.style.boxShadow   = "0 0 0 3px rgba(26,86,219,.1)";
};
const onBlur = (e, err) => {
  e.target.style.borderColor = err ? "#fca5a5" : "#d1d5db";
  e.target.style.boxShadow   = "none";
};

// ─── Label ────────────────────────────────────────────────────────────────────
export const Label = ({ children, required, hint }) => (
  <label style={{ fontSize: 13, fontWeight: 500, color: "#374151", display: "block", marginBottom: 5 }}>
    {children}
    {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
    {hint && <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 400, marginLeft: 5 }}>({hint})</span>}
  </label>
);

// ─── Error message ────────────────────────────────────────────────────────────
export const ErrMsg = ({ msg }) =>
  msg ? <p style={{ fontSize: 11, color: "#ef4444", marginTop: 3 }}>{msg}</p> : null;

// ─── Field wrapper ────────────────────────────────────────────────────────────
export const Field = ({ children, error, style }) => (
  <div style={style}>
    {children}
    <ErrMsg msg={error} />
  </div>
);

// ─── Input ────────────────────────────────────────────────────────────────────
export const Input = ({ value, onChange, placeholder, type = "text", min, max, disabled, error, id }) => (
  <input
    id={id} type={type} value={value} onChange={onChange}
    placeholder={placeholder} min={min} max={max} disabled={disabled}
    style={{
      ...S.inputBase(error),
      ...(disabled ? { background: "#f9fafb", color: "#9ca3af", cursor: "not-allowed" } : {}),
    }}
    onFocus={onFocus}
    onBlur={(e) => onBlur(e, error)}
  />
);

// ─── Select ───────────────────────────────────────────────────────────────────
const SELECT_ARROW = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E")`;

export const Select = ({ value, onChange, options, placeholder, disabled, error }) => (
  <select
    value={value} onChange={onChange} disabled={disabled}
    style={{
      ...S.inputBase(error),
      cursor: disabled ? "not-allowed" : "pointer",
      backgroundImage: SELECT_ARROW,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 10px center",
      paddingRight: 28,
      ...(disabled ? { background: "#f9fafb", color: "#9ca3af" } : {}),
    }}
    onFocus={onFocus}
    onBlur={(e) => onBlur(e, error)}
  >
    <option value="">{placeholder}</option>
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

// ─── Textarea ─────────────────────────────────────────────────────────────────
export const Textarea = ({ value, onChange, placeholder, rows = 3, id, error }) => (
  <textarea
    id={id} value={value} onChange={onChange} placeholder={placeholder} rows={rows}
    style={{ ...S.inputBase(error), resize: "vertical", lineHeight: 1.6 }}
    onFocus={onFocus}
    onBlur={(e) => onBlur(e, error)}
  />
);

// ─── Grid ─────────────────────────────────────────────────────────────────────
export const Grid = ({ children, cols = 2, gap = 14 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap, marginBottom: gap }}>
    {children}
  </div>
);

// ─── Section block ────────────────────────────────────────────────────────────
export const SecBlock = ({ title, children }) => (
  <div style={{ marginBottom: 24 }}>
    <p style={{
      fontSize: 11, fontWeight: 700, color: "#9ca3af",
      textTransform: "uppercase", letterSpacing: 0.8,
      marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid #f3f4f6",
    }}>
      {title}
    </p>
    {children}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────
export const StatCard = ({ icon, value, label, iconBg }) => (
  <div className="exam-card" style={{
    background: "#fff", borderRadius: 12, padding: "20px 22px",
    border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 16,
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 12,
      background: iconBg || "#eff6ff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 22, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize: 26, fontWeight: 700, color: "#0f172a", lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 13, color: "#6b7280", marginTop: 3 }}>{label}</p>
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
export const StatusBadge = ({ status, meta }) => (
  <span style={{
    background: meta.bg, color: meta.color,
    fontSize: 11, fontWeight: 600, padding: "4px 11px", borderRadius: 20,
    display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
  }}>
    <span style={{ width: 6, height: 6, borderRadius: 3, background: meta.dot, display: "inline-block" }} />
    {meta.label}
  </span>
);

// ─── Pill badge ───────────────────────────────────────────────────────────────
export const Pill = ({ label, bg, color }) => (
  <span style={{
    background: bg, color, fontSize: 11, fontWeight: 600,
    padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap",
  }}>
    {label}
  </span>
);

// ─── Primary Button ───────────────────────────────────────────────────────────
export const BtnPrimary = ({ children, onClick, disabled, style = {} }) => (
  <button
    className="exam-btn-primary"
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: "9px 26px", background: disabled ? "#93c5fd" : BRAND,
      color: "#fff", border: "none", borderRadius: 8,
      fontSize: 13, fontWeight: 600,
      cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "inherit",
      ...style,
    }}
  >
    {children}
  </button>
);

// ─── Ghost Button ─────────────────────────────────────────────────────────────
export const BtnGhost = ({ children, onClick, style = {} }) => (
  <button
    onClick={onClick}
    style={{
      padding: "9px 20px", border: "1px solid #e5e7eb", borderRadius: 8,
      fontSize: 13, cursor: "pointer", background: "#fff",
      color: "#6b7280", fontFamily: "inherit", ...style,
    }}
  >
    {children}
  </button>
);

// ─── Filter Select ────────────────────────────────────────────────────────────
export const FilterSelect = ({ value, onChange, options, placeholder }) => (
  <select
    value={value} onChange={onChange}
    style={{
      border: "1px solid #d1d5db", borderRadius: 8, padding: "7px 28px 7px 10px",
      fontSize: 13, background: "#fff", color: "#374151", outline: "none",
      cursor: "pointer", fontFamily: "inherit",
      backgroundImage: SELECT_ARROW, backgroundRepeat: "no-repeat",
      backgroundPosition: "right 8px center",
    }}
  >
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, backdropFilter: "blur(2px)",
      }}
    >
      <div
        className="exam-fade"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 16, padding: "28px 32px",
          width: 420, maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,.18)",
        }}
      >
        {title && (
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};

// ─── Toast ────────────────────────────────────────────────────────────────────
export const Toast = ({ toast, onClose }) => {
  if (!toast) return null;
  const isSuccess = toast.type === "success";
  return (
    <div
      className="exam-fade"
      style={{
        position: "fixed", top: 20, right: 20, zIndex: 10000,
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 500,
        boxShadow: "0 8px 24px rgba(0,0,0,.12)",
        background: isSuccess ? "#f0fdf4" : "#fef2f2",
        border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
        color: isSuccess ? "#15803d" : "#dc2626",
        maxWidth: 320,
      }}
    >
      <span>{isSuccess ? "✓" : "✕"}</span>
      <span style={{ flex: 1 }}>{toast.msg}</span>
      <button
        onClick={onClose}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "inherit", opacity: 0.5, fontSize: 18, lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, subtitle, action, onAction }) => (
  <div style={{ textAlign: "center", padding: "56px 32px", color: "#9ca3af" }}>
    <p style={{ fontSize: 40, marginBottom: 14 }}>{icon}</p>
    <p style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{title}</p>
    {subtitle && <p style={{ fontSize: 13, marginBottom: action ? 20 : 0 }}>{subtitle}</p>}
    {action && (
      <button
        className="exam-btn-primary"
        onClick={onAction}
        style={{
          padding: "9px 22px", background: BRAND, color: "#fff",
          border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
        }}
      >
        {action}
      </button>
    )}
  </div>
);

// ─── Page Header ──────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, back, onBack, actions }) => (
  <div style={{ marginBottom: 22 }}>
    {back && (
      <button
        onClick={onBack}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          color: BRAND, fontSize: 13, fontWeight: 600, padding: 0,
          marginBottom: 12, fontFamily: "inherit",
        }}
      >
        ← {back}
      </button>
    )}
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
    </div>
  </div>
);
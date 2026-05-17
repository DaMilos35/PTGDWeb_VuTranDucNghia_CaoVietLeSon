import { DS } from "../../design/tokens";

export function Skeleton({ width, height, borderRadius = 8, style: sx }) {
  return (
    <div 
      className="skeleton" 
      style={{ 
        width: width || "100%", 
        height: height || "1rem", 
        borderRadius, 
        ...sx 
      }} 
    />
  );
}

export function ProductSkeleton() {
  return (
    <div style={{ background: "#fff", borderRadius: 24, border: `1px solid ${DS.border}`, overflow: "hidden" }}>
      <Skeleton height="200px" borderRadius={0} />
      <div style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <Skeleton width="40%" height="12px" />
          <Skeleton width="20%" height="12px" />
        </div>
        <Skeleton width="90%" height="18px" style={{ marginBottom: 8 }} />
        <Skeleton width="70%" height="18px" style={{ marginBottom: 20 }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Skeleton width="50%" height="24px" />
          <Skeleton width="20%" height="12px" />
        </div>
      </div>
    </div>
  );
}

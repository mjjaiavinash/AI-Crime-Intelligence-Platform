import React, { useEffect, useRef } from "react";
import cytoscape from "cytoscape";

export default function NetworkGraph({ nodes = [], edges = [] }) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Build elements list for cytoscape
    const cyElements = [];

    nodes.forEach(node => {
      let color = "#475569"; // Gray
      let shape = "ellipse";

      if (node.type === "suspect") {
        color = "#ef4444"; // Red for suspects
        shape = "rectangle";
      } else if (node.type === "fir") {
        color = "#3b82f6"; // Blue for crimes/FIRs
        shape = "diamond";
      } else if (node.type === "vehicle") {
        color = "#eab308"; // Yellow for vehicles
        shape = "triangle";
      } else if (node.type === "bank_account") {
        color = "#10b981"; // Green for bank accounts
        shape = "round-hexagon";
      }

      cyElements.push({
        data: { id: node.id, label: node.label, type: node.type },
        style: {
          "background-color": color,
          "shape": shape,
          "label": node.label,
          "color": "#f1f5f9", // text label color
          "font-size": "10px",
          "text-valign": "bottom",
          "text-margin-y": 4,
          "width": "30px",
          "height": "30px"
        }
      });
    });

    edges.forEach(edge => {
      cyElements.push({
        data: {
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          label: edge.label || ""
        },
        style: {
          "width": 2,
          "line-color": "#64748b",
          "target-arrow-color": "#64748b",
          "target-arrow-shape": "triangle",
          "curve-style": "bezier",
          "label": edge.label || "",
          "font-size": "8px",
          "color": "#94a3b8",
          "text-rotation": "autorotate",
          "text-margin-y": -8
        }
      });
    });

    cyRef.current = cytoscape({
      container: containerRef.current,
      elements: cyElements,
      style: [
        {
          selector: "node",
          style: {
            "text-background-opacity": 0.7,
            "text-background-color": "#1e293b",
            "text-background-padding": "3px",
            "text-background-shape": "roundrectangle"
          }
        }
      ],
      layout: {
        name: "cose", // Force-directed layout
        padding: 40,
        animate: true,
        animationDuration: 500
      }
    });

    return () => {
      if (cyRef.current) {
        cyRef.cyRef = null;
      }
    };
  }, [nodes, edges]);

  return (
    <div className="w-full h-full rounded-xl border border-slate-700 bg-slate-900 overflow-hidden shadow-inner relative" style={{ minHeight: "450px" }}>
      <div ref={containerRef} className="absolute inset-0 w-full h-full z-10" />
      <div className="absolute top-3 right-3 bg-slate-800/80 backdrop-blur border border-slate-700 px-3 py-2 rounded text-xs text-slate-300 z-20 space-y-1">
        <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 mb-1">Legend</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 inline-block rounded-sm"></span> Suspect</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 inline-block rotate-45"></span> FIR / Case</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-yellow-500 inline-block clip-triangle" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}></span> Vehicle</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 inline-block rounded-full"></span> Bank Account</div>
      </div>
    </div>
  );
}

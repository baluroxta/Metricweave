"use client";

import React from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Briefcase,
  Check,
  Sparkles,
} from "lucide-react";
import { TEMPLATE_DEFINITIONS, TemplateType } from "@/lib/templates";

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  recommendedDomain: string;
  onSelectTemplate: (templateId: TemplateType) => void;
}

const TEMPLATE_ICONS: Record<string, React.ReactNode> = {
  sales: <TrendingUp className="size-5" />,
  finance: <DollarSign className="size-5" />,
  hr: <Users className="size-5" />,
  marketing: <Target className="size-5" />,
  executive: <Briefcase className="size-5" />,
};

export default function TemplateSelector({
  selectedTemplate,
  recommendedDomain,
  onSelectTemplate,
}: TemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-foreground">Select Business Template</h3>
        <p className="text-xs text-muted-foreground">
          Templates dynamically adapt to your dataset and calculate deterministic metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {TEMPLATE_DEFINITIONS.map((tmpl) => {
          const isSelected = selectedTemplate === tmpl.id;
          const isRecommended = recommendedDomain === tmpl.id;

          return (
            <button
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`relative p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-3 group ${
                isSelected
                  ? "border-blue-500 bg-blue-500/10 shadow-md shadow-blue-500/10 ring-1 ring-blue-500"
                  : "border-border/60 bg-card hover:border-border hover:bg-muted/30"
              }`}
            >
              {isRecommended && (
                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm flex items-center gap-1">
                  <Sparkles className="size-2.5" /> Recommended
                </span>
              )}

              <div className="space-y-2">
                <div
                  className={`size-9 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground group-hover:text-foreground"
                  }`}
                >
                  {TEMPLATE_ICONS[tmpl.id]}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-foreground">{tmpl.name}</h4>
                  <span className="text-[10px] text-muted-foreground">{tmpl.category}</span>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground line-clamp-3 leading-relaxed">
                {tmpl.description}
              </p>

              <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px]">
                <span className="font-medium text-muted-foreground">
                  {isSelected ? "Active Template" : "Select"}
                </span>
                {isSelected && <Check className="size-3.5 text-blue-500" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

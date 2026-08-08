"use client";

import { useState } from "react";
import {
  FileText,
  Video,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AIContent } from "@/lib/ai-api";

interface ContentSelectorProps {
  contents: AIContent[];
  selectedId?: string;
  onSelect: (content: AIContent) => void;
  onUpload?: () => void;
  onProcessVideo?: () => void;
  onDelete?: (id: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export default function ContentSelector({
  contents,
  selectedId,
  onSelect,
  onUpload,
  onProcessVideo,
  onDelete,
  onRefresh,
  isLoading,
}: ContentSelectorProps) {
  const [expanded, setExpanded] = useState(true);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "READY":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "PROCESSING":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case "ERROR":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "VIDEO_TRANSCRIPT" ? (
      <Video className="w-4 h-4" />
    ) : (
      <FileText className="w-4 h-4" />
    );
  };

  return (
    <div className="bg-background rounded-xl border overflow-hidden" dir="rtl">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">المحتوى المتاح</h3>
          </div>
          <div className="flex gap-1">
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh} disabled={isLoading}>
                <Loader2 className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
              {expanded ? "−" : "+"}
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          {onUpload && (
            <Button variant="outline" size="sm" onClick={onUpload} className="flex-1">
              <Upload className="w-4 h-4 ml-1" />
              رفع ملف
            </Button>
          )}
          {onProcessVideo && (
            <Button variant="outline" size="sm" onClick={onProcessVideo} className="flex-1">
              <Video className="w-4 h-4 ml-1" />
              معالجة فيديو
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="max-h-80 overflow-y-auto">
          {contents.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">لا يوجد محتوى بعد</p>
              <p className="text-xs mt-1">
                ارفع ملفاً أو قم بمعالجة فيديو للبدء
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {contents.map((content) => (
                <div
                  key={content._id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    selectedId === content._id ? "bg-primary/5 border-r-2 border-r-primary" : ""
                  }`}
                  onClick={() => content.status === "READY" && onSelect(content)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="mt-0.5">{getTypeIcon(content.type)}</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{content.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getStatusIcon(content.status)}
                          <span className="text-xs text-muted-foreground">
                            {content.type === "VIDEO_TRANSCRIPT" ? "نص فيديو" : "مستند"}
                          </span>
                          {content.metadata?.pageCount && (
                            <span className="text-xs text-muted-foreground">
                              {content.metadata.pageCount} صفحة
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(content._id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

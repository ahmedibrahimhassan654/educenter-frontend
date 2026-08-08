"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Flashcard {
  id: number;
  front: string;
  back: string;
  category?: string;
}

interface FlashcardViewerProps {
  flashcards: Flashcard[];
}

export default function FlashcardViewer({ flashcards }: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<number>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<number>>(new Set());

  const currentCard = flashcards[currentIndex];
  const totalCards = flashcards.length;

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % totalCards);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + totalCards) % totalCards);
  };

  const markKnown = () => {
    setKnownCards((prev) => {
      const next = new Set(prev);
      next.add(currentCard.id);
      return next;
    });
    nextCard();
  };

  const markUnknown = () => {
    setUnknownCards((prev) => {
      const next = new Set(prev);
      next.add(currentCard.id);
      return next;
    });
    nextCard();
  };

  const resetProgress = () => {
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (!currentCard) return null;

  const progress = Math.round(((currentIndex + 1) / totalCards) * 100);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">بطاقات المراجعة</h3>
            <p className="text-xs text-muted-foreground">
              {currentIndex + 1} من {totalCards}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={resetProgress}>
          <RotateCcw className="w-4 h-4 ml-1" />
          إعادة تعيين
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {knownCards.size} معروفة | {unknownCards.size} تحتاج مراجعة
        </span>
      </div>

      <div
        className="relative cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`relative w-full min-h-64 transition-transform duration-500 transform-style-preserve-3d ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-background rounded-xl border-2 border-primary/20 p-8 flex flex-col items-center justify-center backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            {currentCard.category && (
              <Badge variant="secondary" className="mb-4">
                {currentCard.category}
              </Badge>
            )}
            <p className="text-xl font-semibold text-center leading-relaxed">
              {currentCard.front}
            </p>
            <p className="text-xs text-muted-foreground mt-4">انقر للقلب</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-primary/5 rounded-xl border-2 border-primary/20 p-8 flex items-center justify-center backface-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-lg text-center leading-relaxed">{currentCard.back}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" onClick={prevCard} className="flex-1">
          <ChevronRight className="w-4 h-4 ml-1" />
          السابق
        </Button>
        <Button
          variant="default"
          onClick={markKnown}
          className="flex-1"
          disabled={knownCards.has(currentCard.id)}
        >
          أعرف هذا ✓
        </Button>
        <Button
          variant="outline"
          onClick={markUnknown}
          className="flex-1"
          disabled={unknownCards.has(currentCard.id)}
        >
          مراجعة مجدداً ✗
        </Button>
        <Button variant="outline" onClick={nextCard} className="flex-1">
          التالي
          <ChevronLeft className="w-4 h-4 mr-1" />
        </Button>
      </div>
    </div>
  );
}

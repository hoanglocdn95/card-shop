"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/common/button";
import { useI18n } from "@/components/providers/i18n-provider";

const ANIMATION_MS = 240;

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ContactModal({ open, onClose }: Props) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const handleClose = useCallback(() => {
    setVisible(false);
    window.setTimeout(() => {
      onClose();
      setMounted(false);
    }, ANIMATION_MS);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    setMounted(true);
    const frame = window.requestAnimationFrame(() => {
      setVisible(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handleClose, mounted]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-[240ms] ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-[240ms]"
        aria-label={t("header.contactClose")}
        onClick={handleClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className={`relative z-10 w-full max-w-md origin-center rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl transition-all duration-[240ms] ease-out ${
          visible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-3 scale-95 opacity-0"
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="contact-modal-title"
              className="text-lg font-bold text-gray-900"
            >
              {t("header.contactTitle")}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{t("header.contactSubtitle")}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label={t("header.contactClose")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-5"
              aria-hidden="true"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <dl className="space-y-3 text-sm text-gray-700">
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-gray-900">
              {t("header.shopName")}
            </dt>
            <dd>HAROKU Card Shop</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-gray-900">
              {t("header.phone")}
            </dt>
            <dd>{t("header.updating")}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-gray-900">
              {t("header.address")}
            </dt>
            <dd>{t("header.updating")}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-gray-900">Facebook</dt>
            <dd>{t("header.updating")}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-gray-900">Youtube</dt>
            <dd>{t("header.updating")}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-28 shrink-0 font-semibold text-gray-900">Tiktok</dt>
            <dd>{t("header.updating")}</dd>
          </div>
        </dl>

        <Button
          type="button"
          className="mt-6 w-full bg-(--primary) hover:bg-(--primary-hover)"
          onClick={handleClose}
        >
          {t("header.contactClose")}
        </Button>
      </div>
    </div>,
    document.body,
  );
}

/**
 * @fileoverview Logger Demo route — showcases all logging features.
 *
 * Single-page demo with tabbed sections covering:
 * - useLogger() hook
 * - Log levels (debug, info, warn, error)
 * - Channels (console, silent, custom)
 * - Structured logging with metadata
 * - Context enrichment
 * - Log filtering
 * - Performance timing
 *
 * @module @stackra/react-logger
 * @category Demo
 */

import { Route } from "@stackra/react-router";
import { DemoLoggerPage } from "./pages";

/**
 * Logger demo — full logging subsystem showcase.
 */
@Route({
  path: "/demo/logger",
  title: "Logger Demo",
  label: "Logger Demo",
  icon: "scroll-text",
  variant: "main",
  hideInMenu: false,
  order: 27,
})
export class DemoLoggerRoute {
  public render(): any {
    return DemoLoggerPage();
  }
}

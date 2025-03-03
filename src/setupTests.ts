// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import "jest-canvas-mock";
import { TextEncoder, TextDecoder } from "util";
import { ReadableStream } from "web-streams-polyfill";

global.ReadableStream = ReadableStream as any;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

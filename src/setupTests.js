import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';
import { fetch, Headers, Request, Response } from 'undici';

global.fetch = fetch;
global.Headers = Headers;
global.Request = Request;
global.Response = Response;

import { OpenAPI } from './client';
OpenAPI.BASE = 'http://localhost:8000';

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

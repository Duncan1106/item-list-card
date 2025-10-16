// Jest setup for testing Lit components and ES modules
// import 'jest-environment-jsdom'; // Dropped as it has no side effects and causes CommonJS issues

// Mock Home Assistant globals if needed
global.window.confirm = jest.fn();
global.CustomEvent = class CustomEvent extends Event {
  constructor(type, options = {}) {
    super(type, options);
    this.detail = options.detail;
  }
};

// Mock Lit's html function for testing
global.html = (strings, ...values) => ({
  strings,
  values,
  toString: () => strings.join(''),
});

// Mock HA icons
global.ha = {
  icon: jest.fn(() => 'mocked-icon'),
};
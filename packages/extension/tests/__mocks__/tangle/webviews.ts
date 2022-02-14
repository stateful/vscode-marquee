export const registerPromise = jest.fn().mockResolvedValue({});
export const listen = jest.fn();
export const on = jest.fn();
export const broadcast = jest.fn();
export const emit = jest.fn();
export const attach = jest.fn().mockReturnValue({ listen, broadcast, on, emit });
export default class Channel {
  public readonly registerPromise: Function = registerPromise;
  public readonly attach: Function = attach;
}

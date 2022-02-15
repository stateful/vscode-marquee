export const sendTelemetryEvent = jest.fn();
export default class TelemetryReporterMock {
  public sendTelemetryEvent = sendTelemetryEvent;
}

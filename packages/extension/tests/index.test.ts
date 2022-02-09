import { activate, deactivate } from '../src';

jest.mock('../src/extension.ts', () => ({
  MarqueeExtension: class {}
}));

jest.useFakeTimers();

test('should activate extension manager', () => {
  expect(typeof deactivate).toBe('function');
  const exp = activate('context' as any);

  const client = { emit: jest.fn() };
  exp.marquee.setup(client as any);

  jest.advanceTimersByTime(2000);
  expect(client.emit).toBeCalledWith('counter', 1);
});

// export function activate(context: vscode.ExtensionContext) {
//   new MarqueeExtension(context);

//   return {
//     /**
//      * demo code for example widget in "/example"
//      */
//     marquee: {
//       setup: (tangle: Client<{ counter: number }>) => {
//         let i = 0;
//         setInterval(() => {
//           tangle.emit('counter', ++i);
//         }, 1000);
//       }
//     }
//   };
// }

// // this method is called when your extension is deactivated
// export function deactivate() {}

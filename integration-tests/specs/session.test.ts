import { driver } from '@wdio/globals';

import { getSessionPayloads } from '../helpers/embrace_server';

describe('Sessions', () => {
  it('should be recorded as foreground', async () => {
    const endSession = await driver.$('~END SESSION');
    await endSession.click();

    const sessionPayloads = await getSessionPayloads();

    expect(sessionPayloads).toHaveLength(1);
    if (sessionPayloads.length > 0) {
      expect(sessionPayloads[0].as).toBe('foreground');
    }
  });
});

import {trimLine} from './textUtils';

describe('trimLine', () => {
  it('returns line without modification if there is nothing to trim', () => {
    expect(trimLine('Delver of Secrets')).toEqual('Delver of Secrets');
  });

  it('trims whitespace', () => {
    expect(trimLine('  Opt      ')).toEqual('Opt');
  });
});

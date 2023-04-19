import {getLines, trimLine} from './textUtils';

describe('trimLine', () => {
  it('returns line without modification if there is nothing to trim', () => {
    expect(trimLine('Delver of Secrets')).toEqual('Delver of Secrets');
  });

  it('trims whitespace', () => {
    expect(trimLine('  Opt      ')).toEqual('Opt');
  });

  it('trims numbers and associated ephemera', () => {
    expect(trimLine('1.  Serra Angel')).toEqual('Serra Angel');
    expect(trimLine('1  Serra Angel')).toEqual('Serra Angel');
    expect(trimLine('1- Serra Angel 88')).toEqual('Serra Angel');
  });

  it('replaces smart quotes with straight quotes', () => {
    expect(trimLine('Ognis, the dragon’s lash')).toEqual("Ognis, the dragon's lash");
    expect(trimLine('Ognis, the dragon‘s lash')).toEqual("Ognis, the dragon's lash");
  });

  it('recursively trims until the same string comes back', () => {
    expect(trimLine('1 6   5 Black lotus')).toEqual('Black lotus');
  });
});

describe('getLines', () => {
  it('removes empty lines', () => {
    const input = `
    foo
    bar
    `;

    expect(getLines(input)).toEqual(['foo', 'bar']);
  });
});

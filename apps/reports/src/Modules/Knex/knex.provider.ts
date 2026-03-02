import { Knex } from 'knex';

export function createKnexProviders(options: Knex.Config[], constants?: string[]) {
  const providers = [];
  for (let i = 0; i < options.length; i++) {
    providers.push({
      provide: constants[i],
      useValue: options[i],
    })
  }
  return providers;
}

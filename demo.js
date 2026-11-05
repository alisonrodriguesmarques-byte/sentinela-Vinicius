if (process.env.NODE_ENV === 'production') {
  console.error('O modo de demonstração não pode ser iniciado em produção.');
  process.exit(1);
}

process.env.DEMO_ADMIN_SHORTCUT = '1';
require('./server');

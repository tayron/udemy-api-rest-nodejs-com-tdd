module.exports = function RecursoIndevidoError(message = 'Este recurso não pertence a este usuário') {
  this.name = 'RecursoIndevidoError';
  this.message = message;
}
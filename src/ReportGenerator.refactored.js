export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  static MAX_USER_ITEM_VALUE = 500;
  static ADMIN_PRIORITY_THRESHOLD = 1000;

  generateReport(reportType, user, items) {
    let report = '';
    let total = 0;

    report += this.generateHeader(reportType, user);
    const result = this.processItems(reportType, user, items);
    report += result.content;
    total = result.total;
    report += this.generateFooter(reportType, total);

    return report.trim();
  }

  generateHeader(reportType, user) {
    if (reportType === 'CSV') {
      return 'ID,NOME,VALOR,USUARIO\n';
    }
    if (reportType === 'HTML') {
      return `<html><body>\n<h1>Relatório</h1>\n<h2>Usuário: ${user.name}</h2>\n<table>\n<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n`;
    }
    return '';
  }

  processItems(reportType, user, items) {
    let content = '';
    let total = 0;

    for (const item of items) {
      if (this.shouldIncludeItem(user, item)) {
        this.markPriorityIfNeeded(user, item);
        content += this.formatItemLine(reportType, item, user);
        total += item.value;
      }
    }

    return { content, total };
  }

  shouldIncludeItem(user, item) {
    if (user.role === 'ADMIN') {
      return true;
    }
    if (user.role === 'USER') {
      return item.value <= ReportGenerator.MAX_USER_ITEM_VALUE;
    }
    return false;
  }

  markPriorityIfNeeded(user, item) {
    if (user.role === 'ADMIN' && item.value > ReportGenerator.ADMIN_PRIORITY_THRESHOLD) {
      item.priority = true;
    }
  }

  formatItemLine(reportType, item, user) {
    if (reportType === 'CSV') {
      return `${item.id},${item.name},${item.value},${user.name}\n`;
    }
    if (reportType === 'HTML') {
      const style = item.priority ? ' style="font-weight:bold;"' : '';
      return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    }
    return '';
  }

  generateFooter(reportType, total) {
    if (reportType === 'CSV') {
      return `\nTotal,,\n${total},,\n`;
    }
    if (reportType === 'HTML') {
      return `</table>\n<h3>Total: ${total}</h3>\n</body></html>\n`;
    }
    return '';
  }
}


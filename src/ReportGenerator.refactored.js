// Classe base para relatórios
class ReportFormatter {
  getHeader() { return ''; }
  formatItem() { return ''; }
  getFooter() { return ''; }
}

class CsvFormatter extends ReportFormatter {
  getHeader() {
    return 'ID,NOME,VALOR,USUARIO\n';
  }

  formatItem(item, user) {
    return `${item.id},${item.name},${item.value},${user.name}\n`;
  }

  getFooter(total) {
    return `\nTotal,,\n${total},,\n`;
  }
}

class HtmlFormatter extends ReportFormatter {
  getHeader(user) {
    return `<html><body>
<h1>Relatório</h1>
<h2>Usuário: ${user.name}</h2>
<table>
<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n`;
  }

  formatItem(item) {
    const style = item.priority ? ' style="font-weight:bold;"' : '';
    return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
  }

  getFooter(total) {
    return `</table>
<h3>Total: ${total}</h3>
</body></html>\n`;
  }
}

// Estratégias de filtragem de itens
class UserStrategy {
  shouldInclude() { return false; }
  postProcessItem() {}
}

class AdminStrategy extends UserStrategy {
  shouldInclude() { return true; }
  postProcessItem(item) {
    if (item.value > 1000) item.priority = true;
  }
}

class CommonUserStrategy extends UserStrategy {
  shouldInclude(item) {
    return item.value <= 500;
  }
}

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const formatter = this.createFormatter(reportType);
    const strategy = this.createStrategy(user);

    let report = formatter.getHeader(user);
    let total = 0;

    for (const item of items) {
      if (!strategy.shouldInclude(item)) continue;

      strategy.postProcessItem(item);
      report += formatter.formatItem(item, user);
      total += item.value;
    }

    report += formatter.getFooter(total);
    return report.trim();
  }

  createFormatter(type) {
    switch (type) {
      case 'CSV': return new CsvFormatter();
      case 'HTML': return new HtmlFormatter();
      default: throw new Error(`Tipo de relatório inválido: ${type}`);
    }
  }

  createStrategy(user) {
    switch (user.role) {
      case 'ADMIN': return new AdminStrategy();
      case 'USER': return new CommonUserStrategy();
      default: throw new Error(`Papel de usuário inválido: ${user.role}`);
    }
  }
}
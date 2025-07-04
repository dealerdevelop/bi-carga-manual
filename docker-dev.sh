#!/bin/bash

# Script para gerenciar o ambiente de desenvolvimento

case "$1" in
  "up")
    echo "🚀 Subindo os serviços..."
    docker-compose up -d
    echo "✅ Serviços iniciados!"
    echo "📊 PgAdmin: http://localhost:5050"
    echo "🗄️  PostgreSQL: localhost:5432"
    ;;
  "down")
    echo "🛑 Parando os serviços..."
    docker-compose down
    echo "✅ Serviços parados!"
    ;;
  "restart")
    echo "🔄 Reiniciando os serviços..."
    docker-compose down
    docker-compose up -d
    echo "✅ Serviços reiniciados!"
    ;;
  "logs")
    docker-compose logs -f
    ;;
  "status")
    docker-compose ps
    ;;
  "reset")
    echo "⚠️  ATENÇÃO: Isso irá apagar todos os dados do banco!"
    read -p "Tem certeza? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      docker-compose down -v
      docker-compose up -d
      echo "✅ Banco resetado!"
    else
      echo "❌ Operação cancelada"
    fi
    ;;
  "setup")
    echo "🔧 Configurando ambiente..."
    npm install
    docker-compose up -d
    sleep 5
    npm run db:generate
    npm run db:migrate
    echo "✅ Ambiente configurado!"
    ;;
  *)
    echo "Uso: $0 {up|down|restart|logs|status|reset|setup}"
    echo ""
    echo "Comandos disponíveis:"
    echo "  up      - Sobe os serviços"
    echo "  down    - Para os serviços"
    echo "  restart - Reinicia os serviços"
    echo "  logs    - Mostra logs dos serviços"
    echo "  status  - Mostra status dos serviços"
    echo "  reset   - Apaga todos os dados e reinicia"
    echo "  setup   - Configuração inicial completa"
    exit 1
    ;;
esac

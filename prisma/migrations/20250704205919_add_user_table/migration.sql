-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contas_bancarias" (
    "id" SERIAL NOT NULL,
    "cod_cnp" TEXT NOT NULL,
    "empresa" TEXT NOT NULL,
    "revenda" TEXT NOT NULL,
    "cod_banco" TEXT NOT NULL,
    "desc_banco" TEXT NOT NULL,
    "agencia" TEXT NOT NULL,
    "conta" TEXT NOT NULL,
    "saldo_banco" DECIMAL(15,2) NOT NULL,
    "ip_origem" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contas_bancarias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "contas_bancarias_cod_cnp_cod_banco_agencia_conta_key" ON "contas_bancarias"("cod_cnp", "cod_banco", "agencia", "conta");

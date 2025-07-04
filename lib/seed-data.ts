import bancosUnicosJson from './bancos_unicos.json'

// Tipagem para os dados do JSON (como vêm do arquivo)
export interface BancoDataRaw {
  codCnp: string;
  empresa: number;
  revenda: number;
  codBanco: number;
  descBanco: string;
  agencia: number;
  conta: number;
}

// Tipagem para os dados processados (como strings para o formulário)
export interface BancoData {
  codCnp: string;
  empresa: string;
  revenda: string;
  codBanco: string;
  descBanco: string;
  agencia: string;
  conta: string;
}

// Converter os dados do JSON para strings
export const seedData: BancoData[] = (bancosUnicosJson as BancoDataRaw[]).map(item => ({
  codCnp: item.codCnp,
  empresa: item.empresa.toString(),
  revenda: item.revenda.toString(),
  codBanco: item.codBanco.toString(),
  descBanco: item.descBanco,
  agencia: item.agencia.toString(),
  conta: item.conta.toString(),
}))

export const empresasFromSeed = Array.from(new Set(seedData.map(item => item.empresa)))
  .map(empresa => ({ value: empresa, label: `Empresa ${empresa}` }))

export const revendasFromSeed = Array.from(new Set(seedData.map(item => item.revenda)))
  .map(revenda => ({ value: revenda, label: `Revenda ${revenda}` }))

export const bancosFromSeed = Array.from(new Set(seedData.map(item => ({
  codigo: item.codBanco,
  nome: item.descBanco
})).map(item => JSON.stringify(item))))
  .map(item => JSON.parse(item))
  .map(banco => ({ 
    codigo: banco.codigo, 
    nome: banco.nome, 
    value: banco.codigo, 
    label: `${banco.codigo} - ${banco.nome}` 
  }))

export const agenciasFromSeed = Array.from(new Set(seedData.map(item => item.agencia)))
  .map(agencia => ({ value: agencia, label: agencia }))

export const contasFromSeed = Array.from(new Set(seedData.map(item => item.conta)))
  .map(conta => ({ value: conta, label: conta }))

export const getBancosByEmpresaRevenda = (empresa: string, revenda: string) => {
  const filteredBancos = seedData
    .filter(item => item.empresa === empresa && item.revenda === revenda)
    .map(item => ({
      codigo: item.codBanco,
      nome: item.descBanco,
      value: item.codBanco,
      label: `${item.codBanco} - ${item.descBanco}`,
      agencia: item.agencia,
      conta: item.conta
    }))

  // Remove duplicatas baseado no código do banco
  return Array.from(
    new Map(filteredBancos.map(banco => [banco.codigo, banco])).values()
  )
}

export const getAgenciasByEmpresaRevenda = (empresa: string, revenda: string) => {
  const filteredAgencias = seedData
    .filter(item => item.empresa === empresa && item.revenda === revenda)
    .map(item => item.agencia)

  return Array.from(new Set(filteredAgencias))
    .map(agencia => ({ value: agencia, label: agencia }))
}

export const getContasByEmpresaRevenda = (empresa: string, revenda: string) => {
  const filteredContas = seedData
    .filter(item => item.empresa === empresa && item.revenda === revenda)
    .map(item => item.conta)

  return Array.from(new Set(filteredContas))
    .map(conta => ({ value: conta, label: conta }))
}

export const getBancoDetails = (codBanco: string, empresa: string, revenda: string) => {
  return seedData.find(item => 
    item.codBanco === codBanco && 
    item.empresa === empresa && 
    item.revenda === revenda
  )
}

export const getAgenciaContaByCodBanco = (codBanco: string, empresa: string, revenda: string) => {
  const banco = getBancoDetails(codBanco, empresa, revenda)
  return banco ? { agencia: banco.agencia, conta: banco.conta } : null
}

export const getAgenciasByEmpresaRevendaBanco = (empresa: string, revenda: string, codBanco: string) => {
  const filteredAgencias = seedData
    .filter(item => item.empresa === empresa && item.revenda === revenda && item.codBanco === codBanco)
    .map(item => item.agencia)

  return Array.from(new Set(filteredAgencias))
    .map(agencia => ({ value: agencia, label: agencia }))
}

export const getContasByEmpresaRevendaBanco = (empresa: string, revenda: string, codBanco: string) => {
  const filteredContas = seedData
    .filter(item => item.empresa === empresa && item.revenda === revenda && item.codBanco === codBanco)
    .map(item => item.conta)

  return Array.from(new Set(filteredContas))
    .map(conta => ({ value: conta, label: conta }))
}

export const getContasByEmpresaRevendaBancoAgencia = (empresa: string, revenda: string, codBanco: string, agencia: string) => {
  const filteredContas = seedData
    .filter(item => 
      item.empresa === empresa && 
      item.revenda === revenda && 
      item.codBanco === codBanco && 
      item.agencia === agencia
    )
    .map(item => item.conta)

  return Array.from(new Set(filteredContas))
    .map(conta => ({ value: conta, label: conta }))
}
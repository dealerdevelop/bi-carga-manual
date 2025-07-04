'use client'

import { useState, useEffect, useCallback } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Combobox } from '@/components/ui/combobox'
import { toast } from 'sonner'
import { DollarSign, Building2, CreditCard } from 'lucide-react'
import { Header } from '@/components/header'
import { empresasFromSeed, revendasFromSeed, getBancosByEmpresaRevenda, getAgenciasByEmpresaRevendaBanco, getContasByEmpresaRevendaBanco, getContasByEmpresaRevendaBancoAgencia } from '@/lib/seed-data'

const formSchema = z.object({
  empresa: z.string().min(1, 'Empresa é obrigatória'),
  revenda: z.string().min(1, 'Revenda é obrigatória'),
  codBanco: z.string().min(1, 'Código do banco é obrigatório'),
  descBanco: z.string().min(1, 'Nome do banco é obrigatório'),
  agencia: z.string().min(1, 'Agência é obrigatória'),
  conta: z.string().min(1, 'Conta é obrigatória'),
  saldoBanco: z.string().min(1, 'Saldo é obrigatório'),
})

type FormData = z.infer<typeof formSchema>

const empresas = empresasFromSeed
const revendas = revendasFromSeed

export default function NovoSaldoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)
  const [isLoadingLastUpdate, setIsLoadingLastUpdate] = useState(true)
  const [lastUpdateId, setLastUpdateId] = useState<number | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [justSubmitted, setJustSubmitted] = useState(false)
  
  const [bancos, setBancos] = useState<Array<{codigo: string, nome: string, value: string, label: string}>>([])
  const [agencias, setAgencias] = useState<Array<{value: string, label: string}>>([])
  const [contas, setContas] = useState<Array<{value: string, label: string}>>([])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      empresa: '',
      revenda: '',
      codBanco: '',
      descBanco: '',
      agencia: '',
      conta: '',
      saldoBanco: '',
    },
  })

  // Observar mudanças na empresa, revenda, banco e agência para atualizar opções
  const empresaValue = form.watch('empresa')
  const revendaValue = form.watch('revenda')
  const codBancoValue = form.watch('codBanco')
  const agenciaValue = form.watch('agencia')

  // Efeito para atualizar bancos quando empresa/revenda mudam
  useEffect(() => {
    if (empresaValue && revendaValue) {
      const filteredBancos = getBancosByEmpresaRevenda(empresaValue, revendaValue)
      setBancos(filteredBancos)
      
      // Limpar seleções de banco, agência e conta quando empresa/revenda mudam
      form.setValue('codBanco', '')
      form.setValue('descBanco', '')
      form.setValue('agencia', '')
      form.setValue('conta', '')
      setAgencias([])
      setContas([])
    } else {
      setBancos([])
      setAgencias([])
      setContas([])
    }
  }, [empresaValue, revendaValue, form])

  // Efeito para atualizar agências quando banco muda
  useEffect(() => {
    if (empresaValue && revendaValue && codBancoValue) {
      const filteredAgencias = getAgenciasByEmpresaRevendaBanco(empresaValue, revendaValue, codBancoValue)
      setAgencias(filteredAgencias)
      
      // Limpar seleções de agência e conta quando banco muda
      form.setValue('agencia', '')
      form.setValue('conta', '')
      setContas([])
    } else {
      setAgencias([])
      setContas([])
    }
  }, [empresaValue, revendaValue, codBancoValue, form])

  // Efeito para atualizar contas quando agência muda
  useEffect(() => {
    if (empresaValue && revendaValue && codBancoValue && agenciaValue) {
      const filteredContas = getContasByEmpresaRevendaBancoAgencia(empresaValue, revendaValue, codBancoValue, agenciaValue)
      setContas(filteredContas)
      
      // Limpar seleção de conta quando agência muda
      form.setValue('conta', '')
    } else if (empresaValue && revendaValue && codBancoValue) {
      // Se não tiver agência selecionada, mostrar todas as contas do banco
      const filteredContas = getContasByEmpresaRevendaBanco(empresaValue, revendaValue, codBancoValue)
      setContas(filteredContas)
    } else {
      setContas([])
    }
  }, [empresaValue, revendaValue, codBancoValue, agenciaValue, form])

  const fetchLastUpdate = useCallback(async (showPolling = false) => {
    try {
      if (showPolling) setIsPolling(true)
      if (!lastUpdateId) setIsLoadingLastUpdate(true)
      
      const response = await fetch('/api/contas-bancarias')
      if (response.ok) {
        const contas = await response.json()
        if (contas.length > 0) {
          const lastRecord = contas[0]
          
          if (lastUpdateId && lastRecord.id !== lastUpdateId && !justSubmitted) {
            toast.info('🔄 Nova atualização detectada de outro usuário!')
          }
          
          setLastUpdate(lastRecord.createdAt)
          setLastUpdateId(lastRecord.id)
          
          if (justSubmitted) {
            setJustSubmitted(false)
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar última atualização:', error)
    } finally {
      setIsLoadingLastUpdate(false)
      if (showPolling) {
        setTimeout(() => setIsPolling(false), 500)
      }
    }
  }, [lastUpdateId, justSubmitted])

  useEffect(() => {
    fetchLastUpdate(false)
    
    const interval = setInterval(() => {
      fetchLastUpdate(true)
    }, 10000)
    
    return () => clearInterval(interval)
  }, [lastUpdateId, fetchLastUpdate])

  const formatLastUpdate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  const formatCurrency = (value: string) => {
    const cleanValue = value.replace(/[^\d.,-]/g, '')
    
    const isNegative = value.trim().startsWith('-') || value.endsWith('-') || value.includes('R$ 0,00-')
    
    const numbers = cleanValue.replace(/\D/g, '')
    
    if ((!numbers || numbers === '') && isNegative) {
      return '-R$ 0,00'
    }
    
    if (!numbers || numbers === '') {
      return 'R$ 0,00'
    }
    
    let decimal = parseFloat(numbers) / 100
    
    if (isNegative) {
      decimal = -Math.abs(decimal)
    }
    
    if (isNaN(decimal)) {
      return isNegative ? '-R$ 0,00' : 'R$ 0,00'
    }
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(decimal)
  }

  const getSaldoColor = (value: string) => {
    if (value.startsWith('-') || value.includes('(-')) {
      return 'text-lg font-semibold text-red-600'
    }
    return 'text-lg font-semibold text-green-600'
  }

  const handleSaldoChange = (value: string, onChange: (value: string) => void) => {
    if (value === 'R$ 0,00-' || (value === 'R$ 0,00' && value.endsWith('-'))) {
      onChange('-R$ 0,00')
      return
    }
    
    if (value === '-') {
      onChange('-R$ 0,00')
      return
    }
    
    const formatted = formatCurrency(value)
    onChange(formatted)
  }

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    
    try {
      let saldoNumerico = data.saldoBanco
        .replace(/[R$\s.]/g, '')
        .replace(',', '.')
      
      const isNegative = data.saldoBanco.trim().startsWith('-') || data.saldoBanco.includes('(-')
      
      saldoNumerico = saldoNumerico.replace(/[^\d.-]/g, '')
      
      let saldoFinal = parseFloat(saldoNumerico)
      
      if (isNaN(saldoFinal)) {
        saldoFinal = 0
      }
      
      if (isNegative && saldoFinal > 0) {
        saldoFinal = -saldoFinal
      }

      const payload = {
        ...data,
        saldoBanco: saldoFinal.toString(),
        codCnp: `CNP${Date.now()}`
      }

      const response = await fetch('/api/contas-bancarias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar saldo bancário')
      }

      toast.success('Saldo bancário cadastrado com sucesso!')
      form.reset()
      setJustSubmitted(true)
      fetchLastUpdate(false)
    } catch (error) {
      toast.error('Erro ao salvar saldo bancário')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      <div className="p-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Novo Saldo Bancário
          </h1>
          <p className="text-gray-600">
            Atualize o saldo bancário
          </p>
        </div>

        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${
              isPolling 
                ? 'bg-blue-500 animate-ping' 
                : isLoadingLastUpdate 
                  ? 'bg-yellow-500 animate-pulse' 
                  : 'bg-green-500 animate-pulse'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isLoadingLastUpdate ? (
                'Carregando última atualização...'
              ) : isPolling ? (
                'Verificando atualizações...'
              ) : lastUpdate ? (
                <>
                  Última atualização manual: <span className="font-medium text-gray-800">{formatLastUpdate(lastUpdate)}</span>
                </>
              ) : (
                'Nenhuma atualização manual encontrada'
              )}
            </span>
            {!isLoadingLastUpdate && !isPolling && (
              <span className="text-xs text-gray-400 ml-2">
                (Auto-atualização a cada 10s)
              </span>
            )}
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 border-b pb-2">
                    <Building2 className="h-4 w-4" />
                    Identificação da Empresa
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="empresa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <FormControl>
                            <Combobox
                              options={empresas}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Selecione a empresa"
                              searchPlaceholder="Pesquisar empresa..."
                              emptyText="Nenhuma empresa encontrada."
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="revenda"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Revenda</FormLabel>
                          <FormControl>
                            <Combobox
                              options={revendas}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Selecione a revenda"
                              searchPlaceholder="Pesquisar revenda..."
                              emptyText="Nenhuma revenda encontrada."
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 border-b pb-2">
                    <CreditCard className="h-4 w-4" />
                    Dados Bancários
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="codBanco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código do Banco</FormLabel>
                          <FormControl>
                            <Combobox
                              options={bancos}
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value)
                                const banco = bancos.find(b => b.codigo === value)
                                if (banco) {
                                  form.setValue('descBanco', banco.nome)
                                  // Não auto-preencher agência e conta, pois agora são filtradas
                                }
                              }}
                              placeholder="Selecione o banco"
                              searchPlaceholder="Pesquisar banco..."
                              emptyText="Nenhum banco encontrado."
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="descBanco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Banco</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Nome será preenchido automaticamente" 
                              {...field} 
                              readOnly 
                              className="bg-gray-50"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="agencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Agência</FormLabel>
                          <FormControl>
                            <Combobox
                              options={agencias}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Selecione a agência"
                              searchPlaceholder="Pesquisar agência..."
                              emptyText="Nenhuma agência encontrada."
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="conta"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conta</FormLabel>
                          <FormControl>
                            <Combobox
                              options={contas}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Selecione a conta"
                              searchPlaceholder="Pesquisar conta..."
                              emptyText="Nenhuma conta encontrada."
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700 border-b pb-2">
                    <DollarSign className="h-4 w-4" />
                    Saldo Bancário
                  </div>
                  <FormField
                    control={form.control}
                    name="saldoBanco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor do Saldo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="R$ 0,00 (digite - para valores negativos)"
                            {...field}
                            onChange={(e) => handleSaldoChange(e.target.value, field.onChange)}
                            className={getSaldoColor(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => form.reset()}
                    className="flex-1"
                  >
                    Limpar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {isLoading ? 'Salvando...' : 'Registrar Saldo'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  )
}
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { seedData } from '@/lib/seed-data'

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...')
    
    const promises = seedData.map(async (item) => {
      return prisma.contaBancaria.upsert({
        where: {
          codCnp_codBanco_agencia_conta: {
            codCnp: item.codCnp,
            codBanco: item.codBanco,
            agencia: item.agencia,
            conta: item.conta
          }
        },
        update: {},
        create: {
          codCnp: item.codCnp,
          empresa: item.empresa,
          revenda: item.revenda,
          codBanco: item.codBanco,
          descBanco: item.descBanco,
          agencia: item.agencia,
          conta: item.conta,
          saldoBanco: 0.00,
          ipOrigem: 'seed'
        }
      })
    })

    await Promise.all(promises)
    console.log(`✅ Seed concluído! ${seedData.length} registros processados.`)
    
  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
    throw error
  }
}

export async function GET() {
  try {
    const count = await prisma.contaBancaria.count()
    
    if (count === 0) {
      console.log('🗄️ Banco vazio detectado. Executando seed...')
      await seedDatabase()
    }
    
    const contas = await prisma.contaBancaria.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json(contas)
  } catch (error) {
    console.error('Erro ao buscar contas bancárias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      codCnp, 
      empresa, 
      revenda, 
      codBanco, 
      descBanco, 
      agencia, 
      conta, 
      saldoBanco 
    } = await request.json()
    
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               request.headers.get('cf-connecting-ip') ||
               'unknown'
    
    const contaBancaria = await prisma.contaBancaria.create({
      data: {
        codCnp,
        empresa,
        revenda,
        codBanco,
        descBanco,
        agencia,
        conta,
        saldoBanco: parseFloat(saldoBanco),
        ipOrigem: ip
      },
    })
    
    return NextResponse.json(contaBancaria, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar conta bancária:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

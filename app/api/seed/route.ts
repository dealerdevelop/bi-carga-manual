import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { seedData } from '@/lib/seed-data'

export async function POST() {
  try {
    console.log('🌱 Executando seed manual...')
    
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
        update: {
          empresa: item.empresa,
          revenda: item.revenda,
          descBanco: item.descBanco,
        },
        create: {
          codCnp: item.codCnp,
          empresa: item.empresa,
          revenda: item.revenda,
          codBanco: item.codBanco,
          descBanco: item.descBanco,
          agencia: item.agencia,
          conta: item.conta,
          saldoBanco: 0.00,
          ipOrigem: 'manual-seed'
        }
      })
    })

    const results = await Promise.all(promises)
    
    return NextResponse.json({
      message: 'Seed executado com sucesso!',
      recordsProcessed: results.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Erro durante o seed manual:', error)
    return NextResponse.json(
      { error: 'Erro ao executar seed', details: error },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Endpoint para seed manual dos dados',
    usage: 'POST /api/seed para executar o seed',
    records: seedData.length
  })
}

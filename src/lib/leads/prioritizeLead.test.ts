/**
 * Tests unitarios para categorizeLead y getSpecialStateNotes.
 * Ejecutar: npx tsx src/lib/leads/prioritizeLead.test.ts
 */

import { categorizeLead, getSpecialStateNotes } from './prioritizeLead'

let passed = 0
let failed = 0

function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) throw new Error(`expected "${expected}", got "${actual}"`)
    },
    toBeNull() {
      if (actual !== null) throw new Error(`expected null, got "${actual}"`)
    },
    not: {
      toBeNull() {
        if (actual === null) throw new Error('expected non-null')
      },
    },
  }
}

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`  ✅ ${name}`)
    passed++
  } catch (e) {
    console.error(`  ❌ ${name}`)
    console.error(`     ${e instanceof Error ? e.message : String(e)}`)
    failed++
  }
}

console.log('\n🧪 prioritizeLead — tests\n')

// ─── Los 7 leads históricos ───────────────────────────────────────────────────

test('Lead 1 — Mary Larson Uhlin → Media (gmail, timeline mediano, sin red flags)', () => {
  expect(categorizeLead({
    email: 'marylarsonuhlin@gmail.com',
    telefono: '+46705893848',
    tipo_propiedad: 'Cualquier tipo',
    presupuesto: '300K - 500K EUR',
    timeline: '3 a 6 meses',
    purpose: 'Segunda residencia',
  })).toBe('Media')
})

test('Lead 2 — Michael Johansen → Alta (email corporativo @flexto.dk + timeline 3-6m)', () => {
  expect(categorizeLead({
    email: 'Michael@flexto.dk',
    telefono: '+4521344386',
    tipo_propiedad: 'Apartamento',
    presupuesto: '300K - 500K EUR',
    timeline: '3 a 6 meses',
    purpose: 'Segunda residencia',
  })).toBe('Alta')
})

test('Lead 3 — Heather Meakin → Alta (timeline "En 3 meses" = urgente)', () => {
  expect(categorizeLead({
    email: 'heathermeakin@thedentalbrokers.co.uk',
    telefono: '+447932517109',
    tipo_propiedad: 'Villa',
    presupuesto: '500K - 1M EUR',
    timeline: 'En 3 meses',
    purpose: 'Segunda residencia',
  })).toBe('Alta')
})

test('Lead 4 — Fabienne Richman → Media (gmail pero ticket bueno, sin red flags)', () => {
  expect(categorizeLead({
    email: 'fabiener@gmail.com',
    telefono: '+4790022180',
    tipo_propiedad: 'Apartamento',
    presupuesto: '500K - 1M EUR',
    timeline: '3 a 6 meses',
    purpose: 'Segunda residencia',
  })).toBe('Media')
})

test('Lead 5 — Beatrice Lenz → Baja (purpose="Mix" activa Regla 2)', () => {
  expect(categorizeLead({
    email: 'Beatricelenz@web.de',
    telefono: '+4917623226572',
    tipo_propiedad: 'Villa',
    presupuesto: '300K - 500K EUR',
    timeline: '3 a 6 meses',
    purpose: 'Mix (residencia + inversión)',
  })).toBe('Baja')
})

test('Lead 6 — Saqlain Abbas → Baja (inconsistencia país GB / teléfono +34)', () => {
  expect(categorizeLead({
    email: 'saqlainabbaspk834@gmail.com',
    telefono: '+34631118046',
    tipo_propiedad: 'Townhouse',
    presupuesto: '300K - 500K EUR',
    timeline: 'Solo explorando',
    purpose: 'Segunda residencia',
    country: 'GB',
  })).toBe('Baja')
})

test('Lead 7 — Andreas Langsch → Alta (presupuesto 1M-2M EUR activa Regla 1)', () => {
  expect(categorizeLead({
    email: 'a.langsch@avr-gruppe.de',
    telefono: '+4916096083833',
    tipo_propiedad: 'Penthouse',
    presupuesto: '1M - 2M EUR',
    timeline: 'Solo explorando',
    purpose: 'Segunda residencia',
  })).toBe('Alta')
})

// ─── getSpecialStateNotes ─────────────────────────────────────────────────────

test('getSpecialStateNotes — Saqlain (GB/+34) devuelve texto de validación', () => {
  expect(getSpecialStateNotes({
    email: 'saqlainabbaspk834@gmail.com',
    telefono: '+34631118046',
    tipo_propiedad: 'Townhouse',
    presupuesto: '300K - 500K EUR',
    timeline: 'Solo explorando',
    purpose: 'Segunda residencia',
    country: 'GB',
  })).toBe('Validar por WhatsApp antes de llamar')
})

test('getSpecialStateNotes — lead normal (sin inconsistencia) devuelve null', () => {
  expect(getSpecialStateNotes({
    email: 'heathermeakin@thedentalbrokers.co.uk',
    telefono: '+447932517109',
    tipo_propiedad: 'Villa',
    presupuesto: '500K - 1M EUR',
    timeline: 'En 3 meses',
    purpose: 'Segunda residencia',
    country: 'GB',
  })).toBeNull()
})

// ─── Casos edge ──────────────────────────────────────────────────────────────

test('Edge: "Solo explorando" + budget bajo sin country → Baja por regla exploring+low', () => {
  expect(categorizeLead({
    email: 'test@gmail.com',
    telefono: '+34600000000',
    tipo_propiedad: 'Apartamento',
    presupuesto: '300K - 500K EUR',
    timeline: 'Solo explorando',
    purpose: 'Segunda residencia',
  })).toBe('Baja')
})

test('Edge: "Solo explorando" + budget 1M → Alta por budget (Regla 1 gana sobre Regla 2)', () => {
  expect(categorizeLead({
    email: 'test@gmail.com',
    telefono: '+34600000000',
    tipo_propiedad: 'Apartamento',
    presupuesto: '1M - 2M EUR',
    timeline: 'Solo explorando',
    purpose: 'Segunda residencia',
  })).toBe('Alta')
})

test('Edge: email corporativo + "Solo explorando" (sin timeline medio) → Media', () => {
  expect(categorizeLead({
    email: 'ceo@empresa.com',
    telefono: '+34600000000',
    tipo_propiedad: 'Villa',
    presupuesto: '500K - 1M EUR',
    timeline: 'Solo explorando',
    purpose: 'Segunda residencia',
  })).toBe('Media')
})

// ─── Resumen ──────────────────────────────────────────────────────────────────

const total = passed + failed
console.log(`\n${'─'.repeat(50)}`)
console.log(`Resultado: ${passed}/${total} tests pasaron`)
if (failed > 0) {
  console.error(`⚠️  ${failed} test(s) fallaron`)
  process.exitCode = 1
} else {
  console.log('✅ Todos los tests pasaron')
}

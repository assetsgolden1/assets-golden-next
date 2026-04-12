export const linkedinMap: Record<string, string> = {
  'Irmaris Cuza': 'https://www.linkedin.com/in/irmaris-cuza-91ab423a8/',
  'NÚRIA CORTÉS': 'https://www.linkedin.com/in/nuriacortesf/',
  'Nuria Cortes': 'https://www.linkedin.com/in/nuriacortesf/',
  'Núria Cortés': 'https://www.linkedin.com/in/nuriacortesf/',
  'Zaira Fortoul': 'https://www.linkedin.com/in/zaira-fortoul-777a9760/',
  'Carmen Artero': 'https://www.linkedin.com/in/carmenarteroagenteinmobiliaria/',
  'Meritxell Mont': 'https://www.linkedin.com/in/meritxellmont/',
  'Bianca David': 'https://www.linkedin.com/in/bianca-david-62a0a6111/',
  'Joan Daunis': 'https://www.linkedin.com/in/joandaunis/',
  'Philip Seifert': 'https://www.linkedin.com/in/philipseifert/',
  'Antonio Cilea': 'https://www.linkedin.com/in/antoniocilea/',
  'Antonio Pastor Perez': 'https://www.linkedin.com/in/antonio-pastor-p%C3%A9rez-17047677/',
  'Antonio Pastor Pérez': 'https://www.linkedin.com/in/antonio-pastor-p%C3%A9rez-17047677/',
  'Amir Kudary': 'https://www.linkedin.com/in/amir-kudary-423069163/',
  'Liliana Lucero': 'https://www.linkedin.com/in/lilianalucero/?locale=es',
  'Iveta Jankovska': 'https://www.linkedin.com/in/iveta-jankovska/',
  'Atilio Miguel Montironi': 'https://www.linkedin.com/in/atilio-miguel-montironi-b8292190/',
  'Joan Manuel Pascual': 'https://www.linkedin.com/in/juan-manuel-pascual/',
}

export function getLinkedin(name: string): string | null {
  return linkedinMap[name] ?? null
}

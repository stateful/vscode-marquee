export interface Since {
  name: string;
  value: string
}

export interface Contributor {
  username: string
  avatar: string
}

export interface SpokenLanguage {
  name: string
  urlParam: string
}

export interface Trend {
  description: string
  url: string
  author: string
  name: string
  currentPeriodStars: number
  language: string
  languageColor: string
  forks: number
  stars: number
  builtBy: Contributor[]
}

import clsx from 'clsx'

export const cn = (...classNames: Array<string | false | null | undefined>) =>
  clsx(classNames)

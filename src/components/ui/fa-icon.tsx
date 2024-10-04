import React from 'react'

type IconStyle = 'fas' | 'far' | 'fal' | 'fat' | 'fad' | 'fab'

interface FaIconProps extends React.HTMLAttributes<HTMLElement> {
  icon: string
  type?: IconStyle
  size?:
    | 'xs'
    | 'sm'
    | 'lg'
    | '1x'
    | '2x'
    | '3x'
    | '4x'
    | '5x'
    | '6x'
    | '7x'
    | '8x'
    | '9x'
    | '10x'
  fixedWidth?: boolean
  spin?: boolean
  pulse?: boolean
  border?: boolean
  pull?: 'left' | 'right'
  rotation?: 90 | 180 | 270
  flip?: 'horizontal' | 'vertical' | 'both'
}

const FaIcon: React.FC<FaIconProps> = ({
  icon,
  type = 'far',
  size,
  fixedWidth,
  spin,
  pulse,
  border,
  pull,
  rotation,
  flip,
  className,
  ...props
}) => {
  const classes = [
    type,
    `fa-${icon}`,
    size && `fa-${size}`,
    fixedWidth && 'fa-fw',
    spin && 'fa-spin',
    pulse && 'fa-pulse',
    border && 'fa-border',
    pull && `fa-pull-${pull}`,
    rotation && `fa-rotate-${rotation}`,
    flip && `fa-flip-${flip}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <i className={classes} {...props}></i>
}

export default FaIcon

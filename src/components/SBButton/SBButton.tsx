import React from 'react';
import cx from 'classnames';

import styles from './SBButton.module.scss';

interface ISBButton {
  outline?: boolean;
  color?:
    | 'red'
    | 'purple'
    | 'blue'
    | 'yellow'
    | 'green'
    | 'cyan'
    | 'white'
    | string;
  className?: string;
  children: any;
  onClick?: (e: Event) => void;
  disabled?: boolean;
}

const SBButton: React.FC<ISBButton> = ({
  outline,
  color,
  className,
  children,
  onClick,
  disabled,
}: ISBButton) => (
  <span
    className={cx(styles.SBButton, className, {
      [styles.outline]: !!outline,
      [styles[color || '']]: color,
      [styles.darkText]: !color,
      [styles.disabled]: disabled,
    })}
    data-testid="SBButton"
    onClick={e => {
      if (onClick && !disabled) {
        onClick((e as unknown) as Event);
      }
    }}
  >
    {children}
  </span>
);

export default SBButton;

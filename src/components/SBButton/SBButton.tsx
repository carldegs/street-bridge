import React, { useState, useRef, useEffect } from 'react';
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
  tempDisableOnClick?: number;
}

const SBButton: React.FC<ISBButton> = ({
  outline,
  color,
  className,
  children,
  onClick,
  disabled,
  tempDisableOnClick,
}: ISBButton) => {
  const [tempDisable, setTempDisable] = useState(false);
  const ref = useRef((0 as unknown) as ReturnType<typeof setTimeout>);

  useEffect(() => {
    return () => {
      clearTimeout(ref.current);
    };
  }, []);

  return (
    <span
      className={cx(styles.SBButton, className, {
        [styles.outline]: !!outline,
        [styles[color || '']]: color,
        [styles.darkText]: !color,
        [styles.disabled]: disabled || tempDisable,
      })}
      data-testid="SBButton"
      onClick={e => {
        if (onClick && !disabled && !tempDisable) {
          onClick((e as unknown) as Event);
          if (tempDisableOnClick) {
            setTempDisable(true);
            ref.current = setTimeout(() => {
              setTempDisable(false);
            }, tempDisableOnClick);
          }
        }
      }}
    >
      {children}
    </span>
  );
};

export default SBButton;

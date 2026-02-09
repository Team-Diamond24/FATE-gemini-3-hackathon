import { motion } from 'framer-motion'
import soundManager from '../utils/soundManager'

/**
 * Button component with sound effects
 */
export default function SoundButton({ 
    children, 
    onClick, 
    className = '', 
    disabled = false,
    variant = 'primary',
    soundType = 'click',
    ...props 
}) {
    const handleClick = (e) => {
        if (disabled) return
        
        // Play sound based on type
        switch (soundType) {
            case 'click':
                soundManager.click()
                break
            case 'success':
                soundManager.success()
                break
            case 'error':
                soundManager.error()
                break
            case 'warning':
                soundManager.warning()
                break
            default:
                soundManager.click()
        }
        
        if (onClick) onClick(e)
    }

    const handleHover = () => {
        if (!disabled) {
            soundManager.hover()
        }
    }

    return (
        <motion.button
            whileTap={disabled ? {} : { scale: 0.98 }}
            onMouseEnter={handleHover}
            onClick={handleClick}
            disabled={disabled}
            className={className}
            {...props}
        >
            {children}
        </motion.button>
    )
}

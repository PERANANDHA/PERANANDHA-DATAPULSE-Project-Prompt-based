
import * as React from "react"

// Define standard breakpoints for better consistency
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536
}

/**
 * Hook to detect if the current viewport is mobile
 * @param breakpoint - Optional custom breakpoint (defaults to md: 768px)
 * @returns boolean indicating if viewport is smaller than breakpoint
 */
export function useIsMobile(breakpoint = BREAKPOINTS.md) {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)

  React.useEffect(() => {
    // Function to handle window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    
    // Set initial value
    handleResize()
    
    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [breakpoint])

  return isMobile
}

/**
 * Hook to get a value based on screen size
 * @param desktopValue - Value to use on desktop screens
 * @param mobileValue - Value to use on mobile screens
 * @param breakpoint - Optional custom breakpoint (defaults to md: 768px)
 * @returns The appropriate value based on screen size
 */
export function useResponsiveValue<T>(
  desktopValue: T, 
  mobileValue: T, 
  breakpoint = BREAKPOINTS.md
): T {
  const isMobile = useIsMobile(breakpoint)
  return isMobile ? mobileValue : desktopValue
}

/**
 * Hook to get values based on different screen sizes
 * @param values - Object containing values for different breakpoints
 * @returns The appropriate value based on current screen size
 */
export function useBreakpointValue<T>(values: {
  base?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  "2xl"?: T;
}): T | undefined {
  const [currentValue, setCurrentValue] = React.useState<T | undefined>(
    values.base
  )

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      
      if (width >= BREAKPOINTS["2xl"] && values["2xl"] !== undefined) {
        setCurrentValue(values["2xl"])
      } else if (width >= BREAKPOINTS.xl && values.xl !== undefined) {
        setCurrentValue(values.xl)
      } else if (width >= BREAKPOINTS.lg && values.lg !== undefined) {
        setCurrentValue(values.lg)
      } else if (width >= BREAKPOINTS.md && values.md !== undefined) {
        setCurrentValue(values.md)
      } else if (width >= BREAKPOINTS.sm && values.sm !== undefined) {
        setCurrentValue(values.sm)
      } else {
        setCurrentValue(values.base)
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [values])

  return currentValue
}

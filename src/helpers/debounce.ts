  // debounce closure - 'Debounce in Javascript': https://www.youtube.com/watch?v=B1P3GFa7jVc
  export default function debounce(fn: any, m: number) {
    let timeout: any;
    return function (...args: any[]) {
      if(timeout) {
        clearTimeout(timeout)
      }
      timeout = setTimeout(() => {
        fn(...args)
      }, m)
    }
  }
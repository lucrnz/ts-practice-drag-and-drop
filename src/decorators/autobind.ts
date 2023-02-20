namespace App {
  export function Autobind(_: any, __: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    return {
      configurable: true,
      enumerable: false,
      get() {
        return method.bind(this);
      }
    } as PropertyDescriptor;
  }
}

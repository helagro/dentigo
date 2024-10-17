declare module 'node-pager' {
    type PagerOptions = string | { [key: string]: string }

    type PagerFn = (string: string, options?: PagerOptions) => Promise<void>

    const pager: PagerFn

    export default pager
}

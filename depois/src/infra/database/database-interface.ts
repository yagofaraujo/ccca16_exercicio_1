export interface Database {
  query(query: string, paramValues?: any[]): Promise<any>;
}

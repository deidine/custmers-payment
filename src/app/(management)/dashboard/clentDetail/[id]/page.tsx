import ClientDetailPage from '@/components/dashboard/payments/ClientDetailPage'
import React from 'react'

export default function page({params}:{params:{id:string}}) {
  return (
   <ClientDetailPage customerId={Number(params.id)}/>
  )
}

// helper function import
import { callDatabase } from "@/lib/backend/databaseCall";

export default function databaseTest({passThrough}){
  return (
    <div>
      <p>
        expected: {`"[{"id":1,"name":"harold"},{"id":2,"name":"charlie"},{"id":3,"name":"michael"},{"id":4,"name":"dennis"},{"id":5,"name":"molly"}]"`}
      </p>
      <p>
        recieved from database: {JSON.stringify(passThrough)}
      </p>
    </div>
  )
}

export async function getServerSideProps(context){

  let passThrough = await callDatabase("SELECT * FROM example");

  console.log(passThrough);

  return {
    props: {
      passThrough
    }
  }

}
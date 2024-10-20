import { type FC } from "react";
import { trpc } from "../../utils/trpc";


const PhoneNumber: FC = () => {

  const { data: phoneNumber, isLoading, error } = trpc.auth.getPhoneNumber.useQuery();


  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {phoneNumber && (
        <>
          ({phoneNumber.slice(0, 3)}) {phoneNumber.slice(3, 6)}-{phoneNumber.slice(6)}
        </>
      )}
    </div>
  );
};

export default PhoneNumber;

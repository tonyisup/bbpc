import { type FC } from "react";
import { trpc } from "../../utils/trpc";


const PhoneNumber: FC = () => {

  const { data: phoneNumber, isLoading, error } = trpc.auth.getPhoneNumber.useQuery();


  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {phoneNumber && (
        <a href={`tel:${phoneNumber}`} className="text-blue-500 hover:underline">
          ({phoneNumber.slice(0, 3)}) {phoneNumber.slice(3, 6)}-{phoneNumber.slice(6)}
        </a>
      )}
    </div>
  );
};

export default PhoneNumber;

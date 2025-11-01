import { Button } from "../button";

interface Props {
  handleCancel: () => void;
  loading?: boolean;
  submitMsg?: string;
}

export default function SubmitButtons({
  handleCancel,
  loading,
  submitMsg,
}: Props) {
  return (
    <div className="flex justify-end space-x-3 pt-4">
      <Button
        type="button"
        size="lg"
        onClick={handleCancel}
        variant="destructive"
        className="text-sm font-medium"
      >
        Annuler
      </Button>
      <Button
        type="submit"
        size="lg"
        disabled={loading}
        className="text-sm font-medium"
      >
        {submitMsg}
      </Button>
    </div>
  );
}

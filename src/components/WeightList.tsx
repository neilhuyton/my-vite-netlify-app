// src/components/WeightList.tsx
import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  TablePagination,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { trpc } from "../trpc";
import { format } from "date-fns";

export default function WeightList() {
  const theme = useTheme();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [weightToDelete, setWeightToDelete] = useState<number | null>(null);

  const { data, isLoading, isError, error, refetch } =
    trpc.getWeights.useQuery();

  const deleteWeight = trpc.deleteWeight.useMutation({
    onSuccess: () => refetch(),
  });

  const handleDeleteClick = (id: number) => {
    setWeightToDelete(id);
    setOpenDialog(true);
  };

  const handleConfirmDelete = () => {
    if (weightToDelete !== null) {
      deleteWeight.mutate({ id: weightToDelete });
    }
    setOpenDialog(false);
    setWeightToDelete(null);
  };

  const handleCancelDelete = () => {
    setOpenDialog(false);
    setWeightToDelete(null);
  };

  const paginatedMeasurements =
    data?.measurements.slice(page * rowsPerPage, (page + 1) * rowsPerPage) ??
    [];

  if (isLoading)
    return <Box sx={{ p: 2, textAlign: "center" }}>Loading...</Box>;
  if (isError)
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>Error: {error?.message}</Box>
    );

  return (
    <Box sx={{ p: 2, mt: 2 }}>
      <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[3] }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Weight Measurements
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Weight (kg)
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Note</TableCell>{" "}
                  {/* Add Note column */}
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMeasurements.length ? (
                  paginatedMeasurements.map((entry) => (
                    <TableRow
                      key={entry.id}
                      sx={{
                        "&:hover": { bgcolor: theme.palette.action.hover },
                      }}
                    >
                      <TableCell>
                        {format(new Date(entry.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell align="right">
                        {entry.weightKg.toFixed(1)}
                      </TableCell>
                      <TableCell>{entry.note || "-"}</TableCell>{" "}
                      {/* Display note or placeholder */}
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(entry.id)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      No measurements
                    </TableCell>{" "}
                    {/* Update colSpan */}
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={data?.measurements.length ?? 0}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{
              ".MuiTablePagination-toolbar": {
                flexWrap: "wrap",
                justifyContent: "center",
                p: 1,
              },
            }}
          />
        </CardContent>
      </Card>

      <Dialog
        open={openDialog}
        onClose={handleCancelDelete}
        aria-labelledby="delete-confirm-title"
        aria-describedby="delete-confirm-description"
      >
        <DialogTitle id="delete-confirm-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-confirm-description">
            Are you sure you want to delete this weight measurement? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

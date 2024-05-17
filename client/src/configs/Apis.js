import axios from 'axios';
const SERVER_CONTEXT = '/api/solar-air';
export const SERVER = 'https://web-iot-server.onrender.com';
export const endpoints = {
    info: `/api/air_0001`,
    chartTemp: `${SERVER_CONTEXT}/bieudonhietdo`,
    chartPower: `${SERVER_CONTEXT}/bieudonangluong`,
    chartPowerAndHudmityTop10: `${SERVER_CONTEXT}/bieudotiengonvadoamTop10`,
    chartHumidityAndNoise: `${SERVER_CONTEXT}/bieudotiengonvadoam`,
    chartHumidityAndPower: (year, month, day) =>
        `${SERVER_CONTEXT}/bieudonangluongvadoamTK?year=${year}&month=${month}&day=${day}`,
    chartHumidityAndPowerByMonth: (year, month) =>
        `${SERVER_CONTEXT}/bieudonangluongvadoamTKThang?year=${year}&month=${month}`,
    chartHumidityAndPowerByTime: (startDateTime, endDateTime) =>
        `${SERVER_CONTEXT}/bieudonangluongvadoamTKChiTiet?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
    chartNoiseAndAtmosphereByMonthAndDay: (year, month, day) =>
        `${SERVER_CONTEXT}/bieudotiengonvakhongkhiTop10?year=${year}&month=${month}&day=${day}`,
    chartNoiseAndAtmosphereByTime: (startDateTime, endDateTime) =>
        `${SERVER_CONTEXT}/bieudotiengonvakhongkhiTKChiTiet?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
    chartTempByMonthAndDay: (year, month, day) =>
        `${SERVER_CONTEXT}/bieudonhietdoTK?year=${year}&month=${month}&day=${day}`,
    chartTempByTime: (startDateTime, endDateTime) =>
        `${SERVER_CONTEXT}/bieudonhietdoTKChiTiet?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
    tableDetailsMinAndMax: (year, month, day) =>
        `${SERVER_CONTEXT}/thongkeminmax?year=${year}&month=${month}&day=${day}`,
    tableDetailsMinAndMaxByTime: (startDateTime, endDateTime) =>
        `${SERVER_CONTEXT}/thongkeminmaxChiTiet?startDateTime=${startDateTime}&endDateTime=${endDateTime}`,
    checkServer: (month, year) =>
        `api/print_month_result?month=${month}&year=${year}`,
};
export const authApi = () => {
    const token = localStorage.getItem('token');
    const instance = axios.create({
        baseURL: 'https://web-iot-server.onrender.com',
        headers: {
            Authorization: token ? `Bearer ${token}` : '',
        },
    });
    return instance;
};
export default axios.create({
    baseURL: SERVER,
});
